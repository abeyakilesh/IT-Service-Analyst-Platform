import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';

const SOCKET_URL = 'http://localhost:5000';

const NotificationListener = () => {
    const { user, isAuthenticated } = useAuthStore();
    const socketRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated || !user) return;

        // Connect to server
        const socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
        });
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('🔌 Socket connected:', socket.id);

            // Join user-specific room
            socket.emit('join', user._id);

            // Join role-based room
            socket.emit('join-role', user.role);
        });

        // --- Notification Handlers ---

        // New ticket created (for admin/analyst)
        socket.on('ticket:created', (data) => {
            toast(
                (t) => (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-blue-400 text-lg">🎫</span>
                            <span className="font-semibold text-sm">New Ticket</span>
                        </div>
                        <p className="text-xs text-slate-300">{data.message}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span className="capitalize">Priority: {data.ticket?.priority}</span>
                            <span>·</span>
                            <span>{data.ticket?.category}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(data.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                ),
                {
                    duration: 6000,
                    icon: null,
                    style: {
                        background: '#1E293B',
                        color: '#F1F5F9',
                        border: '1px solid #334155',
                        maxWidth: '380px',
                    },
                }
            );
        });

        // Ticket status updated (for user — their ticket)
        socket.on('ticket:updated', (data) => {
            const isResolved = data.ticket?.status === 'resolved';
            toast(
                (t) => (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{isResolved ? '✅' : '🔄'}</span>
                            <span className="font-semibold text-sm">
                                {isResolved ? 'Ticket Resolved' : 'Ticket Updated'}
                            </span>
                        </div>
                        <p className="text-xs text-slate-300">{data.message}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span>By: {data.updatedBy?.name} ({data.updatedBy?.role})</span>
                        </div>
                        {data.resolvedAt && (
                            <p className="text-xs text-emerald-400 mt-0.5">
                                Resolved at: {new Date(data.resolvedAt).toLocaleString()}
                            </p>
                        )}
                        <p className="text-xs text-slate-500 mt-0.5">
                            {new Date(data.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                ),
                {
                    duration: 8000,
                    icon: null,
                    style: {
                        background: '#1E293B',
                        color: '#F1F5F9',
                        border: `1px solid ${isResolved ? '#16A34A33' : '#334155'}`,
                        maxWidth: '380px',
                    },
                }
            );
        });

        // Status change notifications for admins/analysts
        socket.on('ticket:status-changed', (data) => {
            toast(
                (t) => (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <span className="text-lg">📋</span>
                            <span className="font-semibold text-sm">Status Changed</span>
                        </div>
                        <p className="text-xs text-slate-300">
                            "{data.ticket?.title}" → <span className="capitalize font-medium">{data.ticket?.status}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
                            <span>By: {data.updatedBy?.name}</span>
                            <span>·</span>
                            <span>{new Date(data.timestamp).toLocaleTimeString()}</span>
                        </div>
                    </div>
                ),
                {
                    duration: 5000,
                    icon: null,
                    style: {
                        background: '#1E293B',
                        color: '#F1F5F9',
                        border: '1px solid #334155',
                        maxWidth: '380px',
                    },
                }
            );
        });

        socket.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
        });

        // Cleanup on unmount
        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated, user?._id, user?.role]);

    return null; // This component doesn't render anything visible
};

export default NotificationListener;
