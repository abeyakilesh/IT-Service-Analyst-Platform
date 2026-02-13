import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
            <Sidebar />
            <div className="ml-64">
                <Navbar />
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
