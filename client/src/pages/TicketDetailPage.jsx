import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineArrowLeft } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getTicket, updateTicket } from '../api/ticketApi';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const TicketDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['ticket', id],
        queryFn: () => getTicket(id),
    });

    const statusMutation = useMutation({
        mutationFn: ({ id, status }) => updateTicket(id, { status }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ticket', id] });
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            toast.success('Status updated!');
        },
        onError: (err) => toast.error(err.response?.data?.error?.message || 'Update failed'),
    });

    const ticket = data?.data?.data;
    if (isLoading) return <LoadingSpinner />;
    if (!ticket) return <p className="text-slate-500 text-center py-12">Ticket not found.</p>;

    const canChangeStatus = ['admin', 'analyst'].includes(user?.role) || ticket.createdBy?._id === user?._id;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                <HiOutlineArrowLeft size={16} />
                Back
            </button>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-6 shadow-sm">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">{ticket.title}</h1>
                        <p className="text-xs text-slate-400 mt-1">ID: {ticket._id}</p>
                    </div>
                    <StatusBadge status={ticket.status} />
                </div>

                {/* Meta Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Priority</p>
                        <p className={`text-sm font-medium capitalize ${ticket.priority === 'high' ? 'text-red-600' : ticket.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {ticket.priority}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Category</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{ticket.categoryId?.name || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Created By</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{ticket.createdBy?.name || '—'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Assigned To</p>
                        <p className="text-sm text-slate-700 dark:text-slate-300">{ticket.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <p className="text-xs text-slate-400 mb-2">Description</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700">{ticket.description}</p>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Created</p>
                        <p className="text-slate-700 dark:text-slate-300">{new Date(ticket.createdAt).toLocaleString()}</p>
                    </div>
                    {ticket.resolvedAt && (
                        <div>
                            <p className="text-xs text-slate-400 mb-1">Resolved</p>
                            <p className="text-slate-700 dark:text-slate-300">{new Date(ticket.resolvedAt).toLocaleString()}</p>
                        </div>
                    )}
                </div>

                {/* Status Change */}
                {canChangeStatus && ticket.status !== 'resolved' && (
                    <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                        {ticket.status === 'open' && (
                            <button
                                onClick={() => statusMutation.mutate({ id: ticket._id, status: 'in-progress' })}
                                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
                            >
                                Start Progress
                            </button>
                        )}
                        <button
                            onClick={() => statusMutation.mutate({ id: ticket._id, status: 'resolved' })}
                            className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-sm"
                        >
                            Mark Resolved
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TicketDetailPage;
