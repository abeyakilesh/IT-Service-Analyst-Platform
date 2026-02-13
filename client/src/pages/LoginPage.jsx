import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { loginUser } from '../api/authApi';
import useAuthStore from '../store/authStore';

const schema = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
});

const DEMO_ACCOUNTS = [
    { label: 'Admin', email: 'admin@acme.com', password: 'admin1234' },
    { label: 'Analyst', email: 'analyst@acme.com', password: 'analyst1234' },
    { label: 'User', email: 'user@acme.com', password: 'user1234' },
];

const LoginPage = () => {
    const [loading, setLoading] = useState(false);
    const [demoLoading, setDemoLoading] = useState(null);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const { register, handleSubmit, setValue, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const res = await loginUser(data);
            login(res.data.data.user, res.data.data.token);
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDemoLogin = async (account) => {
        setDemoLoading(account.label);
        try {
            const res = await loginUser({ email: account.email, password: account.password });
            login(res.data.data.user, res.data.data.token);
            toast.success(`Logged in as ${account.label}!`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.error?.message || 'Demo login failed — run the database seeder first.');
        } finally {
            setDemoLoading(null);
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
                    Empowering Enterprise Intelligence with Advanced IT Service Analytics.
                </p>
            </div>

            {/* Right — Form */}
            <div className="p-12 flex flex-col justify-center bg-[#1E293B]/50">
                <h2 className="text-2xl font-bold text-white mb-1">Login</h2>
                <p className="text-sm text-slate-400 mb-8">Welcome back, sign in to continue.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                            placeholder="••••••••"
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        />
                        {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                {/* Demo Login Section */}
                <div className="mt-6 pt-5 border-t border-slate-700/60">
                    <p className="text-xs text-slate-500 text-center mb-3 uppercase tracking-wider font-medium">Quick Demo Login</p>
                    <div className="grid grid-cols-3 gap-3">
                        {DEMO_ACCOUNTS.map((account) => (
                            <button
                                key={account.label}
                                type="button"
                                disabled={!!demoLoading}
                                onClick={() => handleDemoLogin(account)}
                                className={`
                                    relative group overflow-hidden bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white py-2.5 rounded-lg text-xs font-semibold transition-all duration-300
                                    shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] border border-slate-700 hover:border-blue-500/50 hover:-translate-y-0.5
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                            >
                                <span className="relative z-10">{demoLoading === account.label ? '...' : account.label}</span>
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-500/10 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-sm text-slate-400 text-center mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                        Register
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
