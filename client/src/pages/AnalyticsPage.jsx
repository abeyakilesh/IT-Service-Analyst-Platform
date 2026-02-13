import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { getAnalyticsSummary } from '../api/analyticsApi';
import LoadingSpinner from '../components/LoadingSpinner';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AnalyticsPage = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['analytics-summary'],
        queryFn: () => getAnalyticsSummary(),
    });

    const s = data?.data?.data;
    if (isLoading) return <LoadingSpinner />;

    const statusData = {
        labels: ['Open', 'In Progress', 'Resolved'],
        datasets: [{ data: [s?.openTickets || 0, s?.inProgressTickets || 0, s?.resolvedTickets || 0], backgroundColor: ['#EAB308', '#3B82F6', '#22C55E'], borderWidth: 0 }],
    };

    const priorityData = {
        labels: Object.keys(s?.ticketsByPriority || {}),
        datasets: [{ label: 'Tickets', data: Object.values(s?.ticketsByPriority || {}), backgroundColor: ['#22C55E', '#EAB308', '#EF4444'], borderRadius: 6 }],
    };

    const catData = {
        labels: (s?.ticketsByCategory || []).map(c => c.name),
        datasets: [{ label: 'Tickets', data: (s?.ticketsByCategory || []).map(c => c.count), backgroundColor: '#3B82F6', borderRadius: 6 }],
    };

    const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#94A3B8' } } }, scales: { x: { ticks: { color: '#64748B' }, grid: { display: false } }, y: { ticks: { color: '#64748B' }, grid: { color: '#1E293B' } } } };
    const dOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#94A3B8', padding: 20 } } }, cutout: '65%' };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">Analytics</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[['Total', s?.totalTickets || 0, 'white'], ['SLA %', (s?.slaComplianceRate || 100) + '%', 'text-green-400'], ['Avg Res', (s?.avgResolutionTimeHours || 0) + 'h', 'text-blue-400'], ['Breaches', s?.slaBreaches || 0, 'text-red-400']].map(([l, v, c]) => (
                    <div key={l} className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 text-center">
                        <p className={`text-3xl font-bold ${c}`}>{v}</p>
                        <p className="text-xs text-slate-400 mt-1">{l}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">By Status</h3>
                    <div className="h-64"><Doughnut data={statusData} options={dOpts} /></div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">By Priority</h3>
                    <div className="h-64"><Bar data={priorityData} options={opts} /></div>
                </div>
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-white mb-4">By Category</h3>
                    <div className="h-64"><Bar data={catData} options={opts} /></div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
