import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getTickets, deleteTicket } from '../api/ticketApi';
import useAuthStore from '../store/authStore';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const TicketListPage = () => {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [filters, setFilters] = useState({ status: '', priority: '', page: 1 });

    const { data, isLoading } = useQuery({
        queryKey: ['tickets', filters],
        queryFn: () => getTickets(filters),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteTicket,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
            toast.success('Ticket deleted');
        },
        onError: (err) => toast.error(err.response?.data?.error?.message || 'Delete failed'),
    });

    const tickets = data?.data?.data || [];
    const pagination = data?.data?.pagination;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tickets</h1>
                <Link
                    to="/tickets/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <HiOutlinePlus size={18} />
                    New Ticket
                </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-3">
                <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
                <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                </select>
            </div>

            {/* Table */}
            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                                    <th className="text-left px-5 py-3 font-medium">Title</th>
                                    <th className="text-left px-5 py-3 font-medium">Category</th>
                                    <th className="text-left px-5 py-3 font-medium">Priority</th>
                                    <th className="text-left px-5 py-3 font-medium">Status</th>
                                    <th className="text-left px-5 py-3 font-medium">Created By</th>
                                    <th className="text-left px-5 py-3 font-medium">Date</th>
                                    {user?.role === 'admin' && <th className="text-left px-5 py-3 font-medium">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {tickets.map((ticket) => (
                                    <tr key={ticket._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-5 py-3">
                                            <Link to={`/tickets/${ticket._id}`} className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                                                {ticket.title}
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">{ticket.categoryId?.name || '—'}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs font-medium capitalize ${ticket.priority === 'high' ? 'text-red-600' : ticket.priority === 'medium' ? 'text-amber-600' : 'text-emerald-600'}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3"><StatusBadge status={ticket.status} /></td>
                                        <td className="px-5 py-3 text-sm text-slate-500 dark:text-slate-400">{ticket.createdBy?.name || '—'}</td>
                                        <td className="px-5 py-3 text-sm text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                        {user?.role === 'admin' && (
                                            <td className="px-5 py-3">
                                                <button
                                                    onClick={() => deleteMutation.mutate(ticket._id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <HiOutlineTrash size={16} />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Page {pagination.page} of {pagination.pages} ({pagination.total} total)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={pagination.page <= 1}
                                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                    className="px-3 py-1 text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={pagination.page >= pagination.pages}
                                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                    className="px-3 py-1 text-xs bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TicketListPage;
