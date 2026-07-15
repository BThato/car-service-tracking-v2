import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuthenticator } from '@aws-amplify/ui-react';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { useState, useEffect } from 'react';

function Layout() {
  const { signOut } = useAuthenticator();
  const navigate = useNavigate();
  const [userAttrs, setUserAttrs] = useState<{
    given_name?: string;
    family_name?: string;
    'custom:role'?: string;
  }>({});

  useEffect(() => {
    fetchUserAttributes().then(attrs => {
      setUserAttrs(attrs as typeof userAttrs);
    }).catch(console.error);
  }, []);

  const role = userAttrs['custom:role'] || 'customer';
  const firstName = userAttrs.given_name || '';
  const lastName = userAttrs.family_name || '';

  const handleLogout = () => {
    signOut();
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/dashboard">Car Service Tracker</Link>
        </div>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          {role === 'customer' && (
            <>
              <Link to="/bookings">My Bookings</Link>
              <Link to="/bookings/new">New Booking</Link>
              <Link to="/vehicles">Vehicles</Link>
            </>
          )}
          {(role === 'engineer' || role === 'admin') && (
            <Link to="/engineer">Work Queue</Link>
          )}
          {role === 'admin' && (
            <>
              <Link to="/admin">Metrics</Link>
              <Link to="/admin/users">Users</Link>
            </>
          )}
          <Link to="/profile">Profile</Link>
        </div>
        <div className="nav-user">
          <span>{firstName} {lastName}</span>
          <span className="role-badge">{role}</span>
          <button onClick={handleLogout} className="btn btn-outline">Logout</button>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
