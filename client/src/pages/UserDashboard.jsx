import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { HiOutlineTicket, HiOutlineCheckCircle, HiOutlineClock, HiOutlinePlus } from 'react-icons/hi';
import { getTickets } from '../api/ticketApi';
import useAuthStore from '../store/authStore';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const UserDashboard = () => {
    const { user } = useAuthStore();

    const { data, isLoading } = useQuery({
        queryKey: ['my-tickets'],
        queryFn: () => getTickets({ limit: 10, sort: '-createdAt' }),
    });

    const tickets = data?.data?.data || [];
    const openCount = tickets.filter((t) => t.status === 'open').length;
    const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

    if (isLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Welcome, {user?.name}</p>
                </div>
                <Link
                    to="/tickets/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                >
                    <HiOutlinePlus size={18} />
                    Create Ticket
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard title="My Open Tickets" value={openCount} icon={<HiOutlineTicket size={24} />} color="blue" />
                <StatCard title="Resolved" value={resolvedCount} icon={<HiOutlineCheckCircle size={24} />} color="green" />
                <StatCard title="Total" value={tickets.length} icon={<HiOutlineClock size={24} />} color="purple" />
            </div>

            {/* Ticket List */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Recent Tickets</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                                <th className="text-left px-5 py-3 font-medium">Title</th>
                                <th className="text-left px-5 py-3 font-medium">Category</th>
                                <th className="text-left px-5 py-3 font-medium">Status</th>
                                <th className="text-left px-5 py-3 font-medium">Date</th>
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
                                    <td className="px-5 py-3"><StatusBadge status={ticket.status} /></td>
                                    <td className="px-5 py-3 text-sm text-slate-400">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                            {tickets.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-5 py-8 text-center text-sm text-slate-400">
                                        No tickets yet. Create your first ticket!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
