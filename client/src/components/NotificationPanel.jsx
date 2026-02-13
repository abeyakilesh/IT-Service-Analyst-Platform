import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    HiX, HiBell, HiChat, HiPaperAirplane,
    HiCheckCircle, HiTicket, HiArrowLeft, HiCheck,
    HiClock, HiUser, HiExclamation,
} from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notificationApi';
import { getMessages, sendMessage, getChatTickets } from '../api/messageApi';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

/* ───── helper ───── */
const timeAgo = (d) => {
    if (!d) return '';
    const ms = Date.now() - new Date(d).getTime();
    const m = Math.floor(ms / 60000);
    if (m < 1) return 'Just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const priorityColor = {
    high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};
const statusColor = {
    open: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    resolved: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

const notifIcon = (type) => {
    const icons = {
        'ticket:created': <HiTicket className="text-blue-400" />,
        'ticket:updated': <HiCheckCircle className="text-emerald-400" />,
        'ticket:assigned': <HiExclamation className="text-amber-400" />,
        'message:new': <HiChat className="text-purple-400" />,
    };
    return icons[type] || <HiBell className="text-slate-400" />;
};

/* ═══════════════════════════════════════════════════════════════ */
const NotificationPanel = ({ isOpen, onClose, onUnreadCountChange }) => {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const socketRef = useRef(null);
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    const [activeTab, setActiveTab] = useState('notifications');
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');

    /* ─── Queries ─── */
    const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: getNotifications,
        enabled: isAuthenticated && isOpen,
        onSuccess: (data) => {
            onUnreadCountChange?.(data.data.unreadCount || 0);
        }
    });

    const notifications = notificationsData?.data?.data || [];
    const unreadCount = notificationsData?.data?.unreadCount || 0;

    const { data: chatTicketsData, isLoading: chatTicketsLoading } = useQuery({
        queryKey: ['chat-tickets'],
        queryFn: getChatTickets,
        enabled: isAuthenticated && isOpen && activeTab === 'chat',
    });

    const chatTickets = chatTicketsData?.data?.data || [];

    const { data: messagesData, isLoading: messagesLoading } = useQuery({
        queryKey: ['messages', selectedTicket?._id],
        queryFn: () => getMessages(selectedTicket._id),
        enabled: isAuthenticated && !!selectedTicket,
    });

    const messages = messagesData?.data?.data || [];

    /* ─── Mutations ─── */
    const markReadMutation = useMutation({
        mutationFn: markNotificationRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const markAllReadMutation = useMutation({
        mutationFn: markAllNotificationsRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    });

    const sendMessageMutation = useMutation({
        mutationFn: (content) => sendMessage(selectedTicket._id, content),
        onMutate: async (content) => {
            await queryClient.cancelQueries({ queryKey: ['messages', selectedTicket._id] });

            const previousMessages = queryClient.getQueryData(['messages', selectedTicket._id]);

            // Optimistically update
            queryClient.setQueryData(['messages', selectedTicket._id], (old) => {
                const oldMessages = old?.data?.data || [];
                const optimisticMessage = {
                    _id: Date.now().toString(), // Temp ID
                    content,
                    senderId: user, // Current user
                    createdAt: new Date().toISOString(),
                    isOptimistic: true,
                };
                return {
                    ...old,
                    data: { ...old.data, data: [...oldMessages, optimisticMessage] }
                };
            });

            return { previousMessages };
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['messages', selectedTicket._id], context.previousMessages);
            console.error('Send failed:', err);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['messages', selectedTicket?._id] });
            queryClient.invalidateQueries({ queryKey: ['chat-tickets'] }); // Update last message in list
        },
    });

    /* ─── Socket ─── */
    useEffect(() => {
        if (!isAuthenticated || !user) return;
        const socket = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('join', user._id);
            socket.emit('join-role', user.role);
        });

        socket.on('notification:new', (data) => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        });

        socket.on('message:new', (data) => {
            // Update messages cache if looking at that ticket
            if (selectedTicket && data.ticketId === selectedTicket._id) {
                queryClient.setQueryData(['messages', data.ticketId], (old) => {
                    if (!old) return old;
                    const oldMessages = old.data?.data || [];
                    // Check if already exists (to avoid optimistic dupe if we handled it differently, but here we rely on invalidate mostly)
                    if (oldMessages.some(m => m._id === data.message._id)) return old;

                    return {
                        ...old,
                        data: { ...old.data, data: [...oldMessages, data.message] }
                    };
                });
            }
            // Always update tickets list to show new last message
            queryClient.invalidateQueries({ queryKey: ['chat-tickets'] });
        });

        return () => { socket.disconnect(); socketRef.current = null; };
    }, [isAuthenticated, user?._id, user?.role, queryClient, selectedTicket]);

    /* ─── Scroll chat ─── */
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /* ─── Focus input on chat open ─── */
    useEffect(() => { if (selectedTicket) inputRef.current?.focus(); }, [selectedTicket]);

    /* ─── Handlers ─── */
    const openChat = (ticket) => {
        const t = ticket._id ? ticket : { _id: ticket, title: '' };
        setSelectedTicket(t);
        setActiveTab('chat');
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedTicket) return;
        sendMessageMutation.mutate(newMessage.trim());
        setNewMessage('');
        inputRef.current?.focus();
    };

    const goToTicket = (id) => { navigate(`/tickets/${id}`); onClose(); };

    if (!isOpen) return null;

    /* ═══════════════════ RENDER ═══════════════════ */
    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={onClose} />

            {/* Panel */}
            <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col animate-slide-in-right border-l border-slate-200 dark:border-slate-700">

                {/* ─── Header ─── */}
                { /* ... same header ... */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    {selectedTicket ? (
                        <div className="flex items-center gap-3 min-w-0">
                            <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition">
                                <HiArrowLeft className="w-5 h-5 text-slate-500" />
                            </button>
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{selectedTicket.title}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <HiChat className="w-3 h-3" /> Ticket Chat
                                    {selectedTicket.assignedTo && (
                                        <span className="ml-1">— {selectedTicket.assignedTo?.name || 'Unassigned'}</span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                {activeTab === 'notifications' ? <HiBell className="w-5 h-5 text-white" /> : <HiChat className="w-5 h-5 text-white" />}
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                    {activeTab === 'notifications' ? 'Notifications' : 'Messages'}
                                </h3>
                                {activeTab === 'notifications' && unreadCount > 0 && (
                                    <p className="text-xs text-indigo-500">{unreadCount} unread</p>
                                )}
                                {activeTab === 'chat' && (
                                    <p className="text-xs text-slate-500">{chatTickets.length} tickets</p>
                                )}
                            </div>
                        </div>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition">
                        <HiX className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* ─── Tab Switcher ─── */}
                {!selectedTicket && (
                    <div className="flex border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                        {['notifications', 'chat'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                    }`}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    {tab === 'notifications' ? <HiBell className="w-4 h-4" /> : <HiChat className="w-4 h-4" />}
                                    {tab === 'notifications' ? 'Notifications' : 'Messages'}
                                    {tab === 'notifications' && unreadCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                            {unreadCount > 9 ? '9+' : unreadCount}
                                        </span>
                                    )}
                                </div>
                                {activeTab === tab && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-500 rounded-full" />}
                            </button>
                        ))}
                    </div>
                )}

                {/* ─── Content ─── */}
                <div className="flex-1 overflow-y-auto">

                    {/* ══════ NOTIFICATIONS TAB ══════ */}
                    {activeTab === 'notifications' && !selectedTicket && (
                        <div>
                            {unreadCount > 0 && (
                                <div className="px-5 py-2 border-b border-slate-100 dark:border-slate-800">
                                    <button onClick={() => markAllReadMutation.mutate()} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium flex items-center gap-1">
                                        <HiCheck className="w-3.5 h-3.5" /> Mark all as read
                                    </button>
                                </div>
                            )}

                            {notificationsLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <HiBell className="w-12 h-12 mb-3 opacity-30" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {notifications.map((n, i) => (
                                        <div
                                            key={n._id || i}
                                            className={`px-5 py-3 flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-950/20' : ''
                                                }`}
                                            onClick={() => {
                                                if (n._id && !n.read) markReadMutation.mutate(n._id);
                                                const ticketId = n.ticketId?._id || n.ticketId;
                                                if (ticketId) openChat({
                                                    _id: ticketId,
                                                    title: n.ticketId?.title || n.title,
                                                    status: n.ticketId?.status,
                                                    priority: n.ticketId?.priority,
                                                });
                                            }}
                                        >
                                            {/* Icon */}
                                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                {notifIcon(n.type)}
                                            </div>
                                            {/* Body */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <p className={`text-sm leading-snug ${!n.read ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300'}`}>
                                                        {n.title}
                                                    </p>
                                                    {!n.read && <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />}
                                                </div>
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                                                {/* Ticket badge */}
                                                {n.ticketId?.title && (
                                                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                        <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                                                            <HiTicket className="w-3 h-3" /> {n.ticketId.title.length > 30 ? n.ticketId.title.substring(0, 30) + '…' : n.ticketId.title}
                                                        </span>
                                                        {n.ticketId.status && (
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColor[n.ticketId.status] || ''}`}>
                                                                {n.ticketId.status}
                                                            </span>
                                                        )}
                                                        {n.ticketId.priority && (
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${priorityColor[n.ticketId.priority] || ''}`}>
                                                                {n.ticketId.priority}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-2 mt-1">
                                                    <HiClock className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════ CHAT TAB — Ticket List ══════ */}
                    {activeTab === 'chat' && !selectedTicket && (
                        <div>
                            {chatTicketsLoading ? (
                                <div className="flex items-center justify-center py-16">
                                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : chatTickets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                                    <HiChat className="w-12 h-12 mb-3 opacity-30" />
                                    <p className="text-sm">No tickets yet</p>
                                    <p className="text-xs mt-1 text-center px-8">Tickets you create or are assigned will appear here for messaging</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {chatTickets.map((t) => (
                                        <div
                                            key={t._id}
                                            className="px-4 py-3 flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                                            onClick={() => openChat(t)}
                                        >
                                            {/* Avatar */}
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 dark:from-indigo-500/30 dark:to-purple-500/30 flex items-center justify-center flex-shrink-0">
                                                <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                                    {(t.assignedTo?.name || t.createdBy?.name || 'T').charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{t.title}</p>
                                                    <span className="text-[11px] text-slate-400 flex-shrink-0">{timeAgo(t.chat?.lastMessageAt || t.updatedAt)}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <HiUser className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {user?.role === 'user'
                                                            ? t.assignedTo?.name || 'Unassigned'
                                                            : t.createdBy?.name || 'Unknown user'
                                                        }
                                                    </span>
                                                </div>
                                                {t.chat?.lastMessage && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                                                        {t.chat.lastMessage.length > 60 ? t.chat.lastMessage.substring(0, 60) + '…' : t.chat.lastMessage}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColor[t.status] || ''}`}>
                                                        {t.status}
                                                    </span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${priorityColor[t.priority] || ''}`}>
                                                        {t.priority}
                                                    </span>
                                                    {t.chat?.messageCount > 0 && (
                                                        <span className="text-[10px] text-slate-400">
                                                            {t.chat.messageCount} msg{t.chat.messageCount > 1 ? 's' : ''}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ══════ CHAT — Messages ══════ */}
                    {selectedTicket && (
                        <div className="flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
                            {/* Ticket info */}
                            <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor[selectedTicket.status] || statusColor.open}`}>
                                            {selectedTicket.status || 'open'}
                                        </span>
                                        {selectedTicket.priority && (
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColor[selectedTicket.priority] || ''}`}>
                                                {selectedTicket.priority}
                                            </span>
                                        )}
                                    </div>
                                    <button onClick={() => goToTicket(selectedTicket._id)} className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">
                                        View Ticket →
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
                                {messagesLoading && messages.length === 0 ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                        <HiChat className="w-10 h-10 mb-2 opacity-30" />
                                        <p className="text-sm font-medium">Start the conversation</p>
                                        <p className="text-xs mt-1 text-center px-6">Send a message to discuss this ticket with the assigned analyst</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        // Helper to safely extract ID and Email
                                        const getUserId = (u) => {
                                            if (!u) return null;
                                            if (typeof u === 'string') return u;
                                            return u._id || u.id;
                                        };
                                        const getUserEmail = (u) => u?.email;

                                        const msgSenderId = getUserId(msg.senderId);
                                        const currentUserId = getUserId(user);

                                        // Check ID match OR Email match (fallback if IDs are stale/mismatched but it's the same user)
                                        const idsMatch = String(msgSenderId) === String(currentUserId);
                                        const emailsMatch = getUserEmail(msg.senderId) && getUserEmail(user) && getUserEmail(msg.senderId) === getUserEmail(user);

                                        const isMine = idsMatch || emailsMatch;

                                        return (
                                            <div
                                                key={msg._id || idx}
                                                className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${msg.isOptimistic ? 'opacity-70' : ''}`}
                                            >
                                                <div className={`max-w-[80%]`}>
                                                    {!isMine && (
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 ml-1 flex items-center gap-1">
                                                            <span className="w-4 h-4 rounded-full bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-[8px] font-bold flex-shrink-0">
                                                                {(msg.senderId?.name || '?').charAt(0).toUpperCase()}
                                                            </span>
                                                            {msg.senderId?.name || 'Unknown'}
                                                            <span className="text-slate-400 text-[10px]">• {msg.senderId?.role}</span>
                                                        </p>
                                                    )}
                                                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isMine
                                                        ? 'bg-indigo-500 text-white rounded-br-md'
                                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md'
                                                        }`}>
                                                        {msg.content}
                                                    </div>
                                                    <p className={`text-[10px] text-slate-400 mt-0.5 ${isMine ? 'text-right mr-1' : 'ml-1'}`}>
                                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )
                                }
                                <div ref={chatEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex gap-2 flex-shrink-0">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/40 transition"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white flex items-center justify-center transition"
                                >
                                    <HiPaperAirplane className="w-5 h-5 rotate-90" />
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};


export default NotificationPanel;
