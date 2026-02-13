import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import NotificationListener from './components/NotificationListener';
import useThemeStore from './store/themeStore';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardRouter from './routes/DashboardRouter';
import TicketListPage from './pages/TicketListPage';
import TicketCreatePage from './pages/TicketCreatePage';
import TicketDetailPage from './pages/TicketDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';
import OrganizationsPage from './pages/OrganizationsPage';
import SLAPage from './pages/SLAPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function App() {
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Protected */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/tickets" element={<TicketListPage />} />
            <Route path="/tickets/new" element={<TicketCreatePage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/analytics" element={<ProtectedRoute roles={['admin', 'analyst']}><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/organizations" element={<ProtectedRoute roles={['admin']}><OrganizationsPage /></ProtectedRoute>} />
            <Route path="/sla" element={<ProtectedRoute roles={['admin', 'analyst']}><SLAPage /></ProtectedRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1E293B', color: '#F1F5F9', border: '1px solid #334155' } }} />
      <NotificationListener />
    </QueryClientProvider>
  );
}

export default App;
