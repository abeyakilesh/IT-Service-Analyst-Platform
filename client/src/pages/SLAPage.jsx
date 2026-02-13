import { useQuery } from '@tanstack/react-query';
import { getSLAs, getCategories } from '../api/categoryApi';
import LoadingSpinner from '../components/LoadingSpinner';

const SLAPage = () => {
    const { data: slaData, isLoading: slaLoading } = useQuery({ queryKey: ['slas'], queryFn: getSLAs });
    const slas = slaData?.data?.data || [];

    if (slaLoading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-white">SLA Configuration</h1>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="text-xs text-slate-500 uppercase bg-slate-800/30">
                            <th className="text-left px-5 py-3 font-medium">Category</th>
                            <th className="text-left px-5 py-3 font-medium">Response Time (min)</th>
                            <th className="text-left px-5 py-3 font-medium">Resolution Time (hrs)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {slas.map(sla => (
                            <tr key={sla._id} className="hover:bg-slate-800/30 transition-colors">
                                <td className="px-5 py-3 text-sm text-slate-300">{sla.categoryId?.name || '—'}</td>
                                <td className="px-5 py-3 text-sm text-slate-300">{sla.responseTime} min</td>
                                <td className="px-5 py-3 text-sm text-slate-300">{sla.resolutionTime} hrs</td>
                            </tr>
                        ))}
                        {slas.length === 0 && (
                            <tr><td colSpan="3" className="px-5 py-8 text-center text-sm text-slate-500">No SLA rules configured yet.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SLAPage;
