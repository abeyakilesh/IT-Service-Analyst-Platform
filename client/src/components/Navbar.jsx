import useAuthStore from '../store/authStore';
import { HiOutlineBell, HiOutlineSearch } from 'react-icons/hi';

const Navbar = () => {
    const { user } = useAuthStore();

    return (
        <header className="h-16 bg-[#0F172A]/80 backdrop-blur-sm border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-slate-800/50 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-72 transition-colors"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
                    <HiOutlineBell size={20} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full"></span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-xs">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-slate-300 hidden md:block">{user?.name}</span>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
