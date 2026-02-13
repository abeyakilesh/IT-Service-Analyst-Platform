import { Link } from 'react-router-dom';
import { HiOutlineTicket, HiOutlineChartBar, HiOutlineShieldCheck } from 'react-icons/hi';

const LandingPage = () => {
    const features = [
        { icon: <HiOutlineTicket size={32} />, title: 'Ticket Management', desc: 'Streamline issue resolution and track ticket lifecycles. Prioritize and assign tasks efficiently.', to: '/tickets' },
        { icon: <HiOutlineShieldCheck size={32} />, title: 'SLA Monitoring', desc: 'Monitor Service Level Agreements in real-time. Proactive alerts for potential breaches.', to: '/sla' },
        { icon: <HiOutlineChartBar size={32} />, title: 'Analytics Dashboard', desc: 'Visualize key performance indicators and identify trends. Customizable widgets and reports.', to: '/analytics' },
    ];

    return (
        <div className="min-h-screen bg-[#0B1120] relative overflow-hidden">
            {/* Background grid effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(26,115,232,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(26,115,232,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

            {/* Nav */}
            <nav className="relative z-10 flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
                <h1 className="text-xl font-bold text-white">
                    <span className="text-blue-400">IT</span> Service Analytics
                </h1>
                <div className="flex gap-3">
                    <Link to="/login" className="px-5 py-2 text-sm text-slate-300 hover:text-white border border-slate-700 rounded-lg hover:border-slate-500 transition-colors">
                        Sign In
                    </Link>
                    <Link to="/register" className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                        Get Started
                    </Link>
                </div>
            </nav>

            {/* Hero */}
            <section className="relative z-10 text-center px-4 pt-20 pb-16 max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-6">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                    Enterprise IT Management Platform
                </div>
                <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                    IT Service Analytics<br />
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Platform</span>
                </h2>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Gain actionable insights into your IT service performance. Optimize operations and ensure compliance with real-time data analytics.
                </p>
                <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-blue-600/25 text-sm">
                    Get Started
                    <span>→</span>
                </Link>
            </section>

            {/* Features */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 pb-20">
                <div className="grid md:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <Link key={i} to={f.to} className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-blue-500/30 hover:bg-slate-900/80 transition-all duration-300 group block">
                            <div className="text-blue-400 mb-4 group-hover:scale-110 transition-transform">{f.icon}</div>
                            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                            <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
