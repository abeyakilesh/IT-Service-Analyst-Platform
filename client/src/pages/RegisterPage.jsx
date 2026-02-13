import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { registerUser } from '../api/authApi';
import { getOrganizations } from '../api/organizationApi';
import useAuthStore from '../store/authStore';

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    organizationId: z.string().min(1, 'Organization is required'),
});

const RegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const [orgs, setOrgs] = useState([]);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        // Fetch orgs for dropdown — public endpoint not available, so fallback gracefully
        getOrganizations()
            .then((res) => setOrgs(res.data.data || []))
            .catch(() => setOrgs([]));
    }, []);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await registerUser(data);
            login(res.data.data.user, res.data.data.token);
            toast.success('Account created!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-5xl grid md:grid-cols-2 bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl">
            {/* Left — Branding */}
            <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] p-12 flex flex-col justify-center">
                <h1 className="text-3xl font-bold text-white mb-2">
                    <span className="text-blue-400">IT</span>SA
                </h1>
                <p className="text-lg text-slate-300 mb-4">IT Service Analytics</p>
                <p className="text-sm text-slate-500 leading-relaxed">
                    Join your organization's IT service management platform. Create an account to get started.
                </p>
            </div>

            {/* Right — Form */}
            <div className="p-12 flex flex-col justify-center bg-[#1E293B]/50">
                <h2 className="text-2xl font-bold text-white mb-1">Register</h2>
                <p className="text-sm text-slate-400 mb-8">Create your account to get started.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                        <input
                            {...register('name')}
                            type="text"
                            placeholder="John Doe"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                        {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="you@company.com"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                        {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="Min. 8 characters"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                        {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Organization</label>
                        <select
                            {...register('organizationId')}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        >
                            <option value="">Select organization</option>
                            {orgs.map((org) => (
                                <option key={org._id} value={org._id}>{org.name}</option>
                            ))}
                        </select>
                        {orgs.length === 0 && (
                            <p className="text-xs text-amber-400 mt-1">No organizations found — run the database seeder first.</p>
                        )}
                        {errors.organizationId && <p className="text-xs text-red-400 mt-1">{errors.organizationId.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creating account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-sm text-slate-400 text-center mt-6">
                    Already have an account?{' '}
                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;
