import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { HiOutlinePlus, HiOutlineTrash, HiOutlinePencil } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { getOrganizations, createOrganization, deleteOrganization } from '../api/organizationApi';
import LoadingSpinner from '../components/LoadingSpinner';

const OrganizationsPage = () => {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', industry: '', size: '' });

    const { data, isLoading } = useQuery({
        queryKey: ['organizations'],
        queryFn: getOrganizations,
    });

    const createMut = useMutation({
        mutationFn: createOrganization,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            toast.success('Organization created');
            setShowForm(false);
            setForm({ name: '', industry: '', size: '' });
        },
        onError: (e) => toast.error(e.response?.data?.error?.message || 'Failed'),
    });

    const deleteMut = useMutation({
        mutationFn: deleteOrganization,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['organizations'] });
            toast.success('Organization deleted');
        },
    });

    const orgs = data?.data?.data || [];
    const formInputClass = "bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Organizations</h1>
                <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                    <HiOutlinePlus size={18} /> Add
                </button>
            </div>

            {showForm && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                    <div className="grid grid-cols-3 gap-4">
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Name" className={formInputClass} />
                        <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} placeholder="Industry" className={formInputClass} />
                        <select value={form.size} onChange={e => setForm({ ...form, size: e.target.value })} className={formInputClass}>
                            <option value="">Size</option>
                            <option value="Small">Small</option>
                            <option value="Medium">Medium</option>
                            <option value="Large">Large</option>
                            <option value="Enterprise">Enterprise</option>
                        </select>
                    </div>
                    <button onClick={() => createMut.mutate(form)} className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors shadow-sm">Create</button>
                </div>
            )}

            {isLoading ? <LoadingSpinner /> : (
                <div className="grid gap-4">
                    {orgs.map(org => (
                        <div key={org._id} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex items-center justify-between hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{org.name}</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{org.industry} · {org.size}</p>
                            </div>
                            <button onClick={() => deleteMut.mutate(org._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                <HiOutlineTrash size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrganizationsPage;
