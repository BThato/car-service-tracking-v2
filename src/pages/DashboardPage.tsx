import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { client } from '../client';
import StageTracker from '../components/StageTracker';
import SkeletonCard from '../components/SkeletonCard';

function DashboardPage() {
  const [firstName, setFirstName] = useState('');
  const [role, setRole] = useState('customer');
  const [serviceOrders, setServiceOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    try {
      const attrs = await fetchUserAttributes();
      setFirstName(attrs.given_name || '');
      setRole(attrs['custom:role'] || 'customer');

      const [ordersRes, bookingsRes] = await Promise.all([
        client.models.ServiceOrder.list(),
        client.models.Booking.list(),
      ]);

      setServiceOrders(ordersRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div>
      <div className="page-header"><h1>Welcome back!</h1></div>
      <section className="section">
        <h2>Active Services</h2>
        <SkeletonCard count={2} />
      </section>
    </div>
  );

  const activeOrders = serviceOrders.filter(o => o.currentStage !== 'completed');

  return (
    <div className="dashboard-page page-loaded">
      <div className="page-header">
        <h1>Welcome back, {firstName}!</h1>
        {role === 'customer' && (
          <Link to="/bookings/new" className="btn btn-primary">Book a Service</Link>
        )}
      </div>

      <section className="section">
        <h2>Active Services</h2>
        {activeOrders.length === 0 ? (
          <p className="empty-state">No active services at the moment.</p>
        ) : (
          <div className="card-grid">
            {activeOrders.map(order => (
              <Link to={`/tracking/${order.id}`} key={order.id} className="card">
                <div className="card-header">
                  <h3>Service Order</h3>
                  <span className={`priority-badge priority-${order.priority || 'normal'}`}>{order.priority || 'normal'}</span>
                </div>
                <p className="card-subtitle">Stage: {order.currentStage?.replace(/_/g, ' ')}</p>
                <StageTracker currentStage={order.currentStage || 'queued'} serviceType="other" compact />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Recent Bookings</h2>
        {bookings.length === 0 ? (
          <p className="empty-state">No bookings yet. Book your first service!</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Service Type</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.slice(0, 5).map(booking => (
                  <tr key={booking.id}>
                    <td>{(booking.serviceType || '').replace(/_/g, ' ')}</td>
                    <td>{booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : '-'}</td>
                    <td><span className={`status-badge status-${booking.status}`}>{booking.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
