import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { createTicket } from '../api/ticketApi';
import { getCategories } from '../api/categoryApi';

const schema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    priority: z.enum(['low', 'medium', 'high'], { required_error: 'Priority is required' }),
    categoryId: z.string().min(1, 'Category is required'),
});

const inputClass =
    'w-full bg-[#0B1120] border border-[#1E3A5F] rounded-md px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';

const TicketCreatePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        getCategories()
            .then((res) => setCategories(res.data.data || []))
            .catch(() => setCategories([]));
    }, []);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await createTicket(data);
            toast.success('Ticket created!');
            navigate('/tickets');
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-start justify-center py-8 px-4">
            <div className="w-full max-w-xl">
                {/* Form Card */}
                <div className="bg-[#111827] border border-[#1E3A5F] rounded-lg p-8">
                    <h1 className="text-xl font-semibold text-white mb-8">Create New Ticket</h1>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Title<span className="text-blue-400">*</span>
                            </label>
                            <input
                                {...register('title')}
                                type="text"
                                placeholder="Enter title..."
                                className={inputClass}
                            />
                            <p className="text-xs text-blue-400 mt-1.5">
                                {errors.title ? errors.title.message : 'Required field'}
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Description<span className="text-blue-400">*</span>
                            </label>
                            <textarea
                                {...register('description')}
                                rows={4}
                                placeholder="Enter detailed description..."
                                className={`${inputClass} resize-none`}
                            />
                            <p className="text-xs text-blue-400 mt-1.5">
                                {errors.description ? errors.description.message : 'Required field'}
                            </p>
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Priority<span className="text-blue-400">*</span>
                            </label>
                            <select {...register('priority')} className={inputClass}>
                                <option value="">Select Priority</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                            <p className="text-xs text-blue-400 mt-1.5">
                                {errors.priority ? errors.priority.message : 'Required field'}
                            </p>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Category<span className="text-blue-400">*</span>
                            </label>
                            <select {...register('categoryId')} className={inputClass}>
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                ))}
                            </select>
                            <p className="text-xs text-blue-400 mt-1.5">
                                {errors.categoryId ? errors.categoryId.message : 'Required field'}
                            </p>
                        </div>

                        {/* Submit — right-aligned */}
                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Submitting...' : 'Submit Ticket'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TicketCreatePage;
