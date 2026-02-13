import { useQuery } from '@tanstack/react-query';
import { HiOutlineTicket, HiOutlineExclamation, HiOutlineCheckCircle, HiOutlineClock } from 'react-icons/hi';
import { getAnalyticsSummary } from '../api/analyticsApi';
import { getTickets } from '../api/ticketApi';
import useAuthStore from '../store/authStore';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
    const { user } = useAuthStore();

    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ['analytics-summary'],
        queryFn: () => getAnalyticsSummary(),
    });

    const { data: recentTickets, isLoading: ticketsLoading } = useQuery({
        queryKey: ['recent-tickets'],
        queryFn: () => getTickets({ limit: 5, sort: '-createdAt' }),
    });

    const summary = analytics?.data?.data;
    const tickets = recentTickets?.data?.data;

    if (analyticsLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-slate-400 mt-1">Welcome back, {user?.name}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Tickets" value={summary?.totalTickets || 0} icon={<HiOutlineTicket size={24} />} color="blue" />
                <StatCard title="Open" value={summary?.openTickets || 0} icon={<HiOutlineExclamation size={24} />} color="yellow" />
                <StatCard title="Resolved" value={summary?.resolvedTickets || 0} icon={<HiOutlineCheckCircle size={24} />} color="green" />
                <StatCard title="SLA Breaches" value={summary?.slaBreaches || 0} icon={<HiOutlineClock size={24} />} color="red" />
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm text-slate-400 mb-1">Avg Resolution Time</p>
                    <p className="text-2xl font-bold text-white">{summary?.avgResolutionTimeHours || 0}h</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm text-slate-400 mb-1">SLA Compliance</p>
                    <p className="text-2xl font-bold text-green-400">{summary?.slaComplianceRate || 100}%</p>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <p className="text-sm text-slate-400 mb-1">In Progress</p>
                    <p className="text-2xl font-bold text-blue-400">{summary?.inProgressTickets || 0}</p>
                </div>
            </div>

            {/* Tickets by Priority */}
            {summary?.ticketsByPriority && (
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">Tickets by Priority</h3>
                    <div className="flex gap-6">
                        {Object.entries(summary.ticketsByPriority).map(([priority, count]) => (
                            <div key={priority} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${priority === 'high' ? 'bg-red-500' : priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                <span className="text-sm text-slate-400 capitalize">{priority}</span>
                                <span className="text-sm font-semibold text-white">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Tickets */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="px-5 py-4 border-b border-slate-800">
                    <h3 className="text-sm font-semibold text-white">Recent Tickets</h3>
                </div>
                {ticketsLoading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-xs text-slate-500 uppercase">
                                    <th className="text-left px-5 py-3 font-medium">Title</th>
                                    <th className="text-left px-5 py-3 font-medium">Priority</th>
                                    <th className="text-left px-5 py-3 font-medium">Status</th>
                                    <th className="text-left px-5 py-3 font-medium">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {tickets?.map((ticket) => (
                                    <tr key={ticket._id} className="hover:bg-slate-800/30 transition-colors">
                                        <td className="px-5 py-3 text-sm text-slate-300">{ticket.title}</td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs font-medium capitalize ${ticket.priority === 'high' ? 'text-red-400' : ticket.priority === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3"><StatusBadge status={ticket.status} /></td>
                                        <td className="px-5 py-3 text-sm text-slate-500">{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
