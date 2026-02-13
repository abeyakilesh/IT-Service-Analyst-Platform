import useAuthStore from '../store/authStore';
import AdminDashboard from '../pages/AdminDashboard';
import UserDashboard from '../pages/UserDashboard';

const DashboardRouter = () => {
    const { user } = useAuthStore();
    return user?.role === 'admin' || user?.role === 'analyst' ? <AdminDashboard /> : <UserDashboard />;
};

export default DashboardRouter;
