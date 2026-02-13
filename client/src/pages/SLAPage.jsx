import { useQuery } from '@tanstack/react-query';
import { getSLAs, getCategories } from '../api/categoryApi';
import LoadingSpinner from '../components/LoadingSpinner';

const SLAPage = () => {
    const { data: slaData, isLoading: slaLoading } = useQuery({ queryKey: ['slas'], queryFn: getSLAs });
    const slas = slaData?.data?.data || [];

    if (slaLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">SLA Configuration</h1>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-900/50">
                            <th className="text-left px-5 py-3 font-medium">Category</th>
                            <th className="text-left px-5 py-3 font-medium">Response Time (min)</th>
                            <th className="text-left px-5 py-3 font-medium">Resolution Time (hrs)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {slas.map(sla => (
                            <tr key={sla._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">{sla.categoryId?.name || '—'}</td>
                                <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">{sla.responseTime} min</td>
                                <td className="px-5 py-3 text-sm text-slate-700 dark:text-slate-300">{sla.resolutionTime} hrs</td>
                            </tr>
                        ))}
                        {slas.length === 0 && (
                            <tr><td colSpan="3" className="px-5 py-8 text-center text-sm text-slate-400">No SLA rules configured yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SLAPage;
