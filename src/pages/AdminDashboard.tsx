import { useState, useEffect } from 'react';
import { client } from '../client';
import LoadingSpinner from '../components/LoadingSpinner';

function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [ordersRes, bookingsRes, usersRes] = await Promise.all([
        client.models.ServiceOrder.list(),
        client.models.Booking.list(),
        client.models.User.list(),
      ]);
      setOrders(ordersRes.data || []);
      setBookings(bookingsRes.data || []);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading admin dashboard..." />;

  const activeOrders = orders.filter(o => o.currentStage !== 'completed');
  const completedOrders = orders.filter(o => o.currentStage === 'completed');
  const engineers = users.filter(u => u.role === 'engineer');
  const customers = users.filter(u => u.role === 'customer');

  // Stage distribution
  const stageDistribution: Record<string, number> = {};
  activeOrders.forEach(o => {
    const stage = o.currentStage || 'queued';
    stageDistribution[stage] = (stageDistribution[stage] || 0) + 1;
  });

  // Bookings by status
  const bookingsByStatus: Record<string, number> = {};
  bookings.forEach(b => {
    const status = b.status || 'pending';
    bookingsByStatus[status] = (bookingsByStatus[status] || 0) + 1;
  });

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <section className="section">
        <h2>Overview</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-value">{activeOrders.length}</div>
            <div className="metric-label">Active Orders</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{completedOrders.length}</div>
            <div className="metric-label">Completed</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{bookings.length}</div>
            <div className="metric-label">Total Bookings</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{customers.length}</div>
            <div className="metric-label">Customers</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{engineers.length}</div>
            <div className="metric-label">Engineers</div>
          </div>
          <div className="metric-card">
            <div className="metric-value">{orders.length}</div>
            <div className="metric-label">Total Orders</div>
          </div>
        </div>
      </section>

      {/* Stage Distribution */}
      <section className="section">
        <h2>Workshop Load by Stage</h2>
        {Object.keys(stageDistribution).length === 0 ? (
          <p className="empty-state">No active orders.</p>
        ) : (
          <div className="stage-bars">
            {Object.entries(stageDistribution).map(([stage, count]) => (
              <div key={stage} className="stage-bar-item">
                <span className="stage-bar-label">{stage.replace(/_/g, ' ')}</span>
                <div className="stage-bar-track">
                  <div className="stage-bar-fill" style={{ width: `${Math.min(count * 20, 100)}%` }} />
                </div>
                <span className="stage-bar-count">{count}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bookings by Status */}
      <section className="section">
        <h2>Bookings by Status</h2>
        <div className="metrics-grid">
          {Object.entries(bookingsByStatus).map(([status, count]) => (
            <div key={status} className="metric-card">
              <div className="metric-value">{count}</div>
              <div className="metric-label">{status}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Engineer Workload */}
      <section className="section">
        <h2>Engineer Workload</h2>
        {engineers.length === 0 ? (
          <p className="empty-state">No engineers registered yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Engineer</th>
                  <th>Active Jobs</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {engineers.map(eng => {
                  const activeJobs = orders.filter(o => o.assignedEngineerId === eng.cognitoId && o.currentStage !== 'completed').length;
                  return (
                    <tr key={eng.id}>
                      <td>{eng.firstName} {eng.lastName}</td>
                      <td><span className={`badge ${activeJobs > 2 ? 'priority-high' : ''}`}>{activeJobs}</span></td>
                      <td>{eng.email}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;
