import { NavLink, useNavigate } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineTicket, HiOutlineOfficeBuilding, HiOutlineChartBar, HiOutlineClock, HiOutlineCog, HiOutlineLogout, HiOutlineClipboardList, HiOutlineMoon, HiOutlineSun } from 'react-icons/hi';
import useAuthStore from '../store/authStore';
import useThemeStore from '../store/themeStore';

const Sidebar = () => {
    const { user, logout } = useAuthStore();
    const { darkMode, toggleDarkMode } = useThemeStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
            ? 'bg-blue-50 text-blue-700 border-l-3 border-blue-600 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-500'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800'
        }`;

    const adminLinks = [
        { to: '/dashboard', icon: <HiOutlineViewGrid size={20} />, label: 'Dashboard' },
        { to: '/tickets', icon: <HiOutlineTicket size={20} />, label: 'Tickets' },
        { to: '/organizations', icon: <HiOutlineOfficeBuilding size={20} />, label: 'Organizations' },
        { to: '/analytics', icon: <HiOutlineChartBar size={20} />, label: 'Analytics' },
        { to: '/sla', icon: <HiOutlineClock size={20} />, label: 'SLA' },
    ];

    const userLinks = [
        { to: '/dashboard', icon: <HiOutlineViewGrid size={20} />, label: 'My Dashboard' },
        { to: '/tickets', icon: <HiOutlineTicket size={20} />, label: 'My Tickets' },
        { to: '/tickets/new', icon: <HiOutlineClipboardList size={20} />, label: 'Create Ticket' },
    ];

    const links = user?.role === 'admin' || user?.role === 'analyst' ? adminLinks : userLinks;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-50 transition-colors duration-300">
            {/* Logo */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                        <span className="text-blue-600 dark:text-blue-400">IT</span> Analytics
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5">Service Platform</p>
                </div>
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Toggle Dark Mode"
                >
                    {darkMode ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
                </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {links.map((link) => (
                    <NavLink key={link.to} to={link.to} className={linkClass}>
                        {link.icon}
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            {/* User Section */}
            <div className="px-4 py-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-semibold text-sm">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:text-slate-400 dark:hover:text-red-400 rounded-lg transition-colors"
                >
                    <HiOutlineLogout size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
