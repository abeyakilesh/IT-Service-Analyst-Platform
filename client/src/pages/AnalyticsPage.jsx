import { useQuery } from '@tanstack/react-query';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { getAnalyticsSummary } from '../api/analyticsApi';
import LoadingSpinner from '../components/LoadingSpinner';
import useThemeStore from '../store/themeStore';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const AnalyticsPage = () => {
    const { darkMode } = useThemeStore();
    const { data, isLoading } = useQuery({
        queryKey: ['analytics-summary'],
        queryFn: () => getAnalyticsSummary(),
    });

    const s = data?.data?.data;
    if (isLoading) return <LoadingSpinner />;

    const txtColor = darkMode ? '#CBD5E1' : '#64748B';
    const gridColor = darkMode ? '#334155' : '#E2E8F0';

    const statusData = {
        labels: ['Open', 'In Progress', 'Resolved'],
        datasets: [{ data: [s?.openTickets || 0, s?.inProgressTickets || 0, s?.resolvedTickets || 0], backgroundColor: ['#F59E0B', '#2563EB', '#16A34A'], borderWidth: 0 }],
    };

    const priorityData = {
        labels: Object.keys(s?.ticketsByPriority || {}),
        datasets: [{ label: 'Tickets', data: Object.values(s?.ticketsByPriority || {}), backgroundColor: ['#16A34A', '#F59E0B', '#DC2626'], borderRadius: 6 }],
    };

    const catData = {
        labels: (s?.ticketsByCategory || []).map(c => c.name),
        datasets: [{ label: 'Tickets', data: (s?.ticketsByCategory || []).map(c => c.count), backgroundColor: '#2563EB', borderRadius: 6 }],
    };

    const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: txtColor } } }, scales: { x: { ticks: { color: txtColor }, grid: { display: false } }, y: { ticks: { color: txtColor }, grid: { color: gridColor } } } };
    const dOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: txtColor, padding: 20 } } }, cutout: '65%' };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analytics</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[['Total', s?.totalTickets || 0, 'text-slate-900 dark:text-white'], ['SLA %', (s?.slaComplianceRate || 100) + '%', 'text-emerald-600'], ['Avg Res', (s?.avgResolutionTimeHours || 0) + 'h', 'text-blue-600'], ['Breaches', s?.slaBreaches || 0, 'text-red-600']].map(([l, v, c]) => (
                    <div key={l} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-center shadow-sm">
                        <p className={`text-3xl font-bold ${c}`}>{v}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{l}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">By Status</h3>
                    <div className="h-64"><Doughnut data={statusData} options={dOpts} /></div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">By Priority</h3>
                    <div className="h-64"><Bar data={priorityData} options={opts} /></div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">By Category</h3>
                    <div className="h-64"><Bar data={catData} options={opts} /></div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
