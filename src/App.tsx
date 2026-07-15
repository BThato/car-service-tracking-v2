import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ConfirmPage from './pages/ConfirmPage';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import MyBookingsPage from './pages/MyBookingsPage';
import TrackingPage from './pages/TrackingPage';
import VehiclesPage from './pages/VehiclesPage';
import EngineerDashboard from './pages/EngineerDashboard';
import ServiceOrderPage from './pages/ServiceOrderPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsersPage from './pages/AdminUsersPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);
  const [role, setRole] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authStatus === 'authenticated') {
      fetchUserAttributes()
        .then(attrs => setRole(attrs['custom:role'] || 'customer'))
        .catch(() => setRole('customer'))
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [authStatus]);

  if (authStatus !== 'authenticated') return <Navigate to="/login" />;
  if (checking) return <div className="loading">Loading...</div>;
  if (roles && role && !roles.includes(role)) return <Navigate to="/dashboard" />;

  return <>{children}</>;
}

function App() {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);
  const isAuthenticated = authStatus === 'authenticated';

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />} />
        <Route path="/confirm" element={<ConfirmPage />} />

        {/* Protected routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />

          {/* Customer routes */}
          <Route path="bookings" element={<MyBookingsPage />} />
          <Route path="bookings/new" element={<BookingPage />} />
          <Route path="tracking/:id" element={<TrackingPage />} />
          <Route path="vehicles" element={<VehiclesPage />} />
          <Route path="profile" element={<ProfilePage />} />

          {/* Engineer routes */}
          <Route
            path="engineer"
            element={<ProtectedRoute roles={['engineer', 'admin']}><EngineerDashboard /></ProtectedRoute>}
          />
          <Route path="service-orders/:id" element={<ServiceOrderPage />} />

          {/* Admin routes */}
          <Route
            path="admin"
            element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>}
          />
          <Route
            path="admin/users"
            element={<ProtectedRoute roles={['admin']}><AdminUsersPage /></ProtectedRoute>}
          />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
