import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from 'aws-amplify/auth';
import { client } from '../client';
import { getNextStage } from '../config/serviceStages';
import LoadingSpinner from '../components/LoadingSpinner';

function EngineerDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [pendingBookings, setPendingBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => { loadData(); }, []);

  // Real-time: observe bookings so new ones appear instantly
  useEffect(() => {
    const sub = client.models.Booking.observeQuery().subscribe({
      next: ({ items }) => {
        const pending = items.filter((b: any) => b.status === 'pending');
        setPendingBookings(pending);
      },
      error: (err) => console.error('Booking observe error:', err),
    });
    return () => sub.unsubscribe();
  }, []);

  // Real-time: observe service orders
  useEffect(() => {
    const sub = client.models.ServiceOrder.observeQuery().subscribe({
      next: ({ items }) => {
        setOrders(items);
      },
      error: (err) => console.error('ServiceOrder observe error:', err),
    });
    return () => sub.unsubscribe();
  }, []);

  const loadData = async () => {
    try {
      const { userId } = await getCurrentUser();
      setCurrentUserId(userId);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptBooking = async (bookingId: string) => {
    setUpdating(bookingId);
    try {
      await client.models.ServiceOrder.create({
        bookingId,
        currentStage: 'queued',
        priority: 'normal' as any,
        assignedEngineerId: currentUserId,
      });
      // Update booking status
      await client.models.Booking.update({
        id: bookingId,
        status: 'confirmed' as any,
      });
      // observeQuery handles UI update automatically
    } catch (error) {
      console.error('Failed to accept booking:', error);
    } finally {
      setUpdating(null);
    }
  };

  const takeJob = async (orderId: string) => {
    setUpdating(orderId);
    try {
      await client.models.ServiceOrder.update({
        id: orderId,
        assignedEngineerId: currentUserId,
      });
      // observeQuery handles UI update automatically
    } catch (error) {
      console.error('Failed to assign job:', error);
    } finally {
      setUpdating(null);
    }
  };

  const advanceStage = async (orderId: string, currentStage: string, serviceType: string) => {
    const nextStage = getNextStage(serviceType || 'other', currentStage);
    if (!nextStage) return;

    setUpdating(orderId);
    try {
      const updateData: any = { id: orderId, currentStage: nextStage };
      if (nextStage === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }
      if (currentStage === 'queued') {
        updateData.startedAt = new Date().toISOString();
      }
      await client.models.ServiceOrder.update(updateData);
      // observeQuery handles UI update automatically
    } catch (error) {
      console.error('Failed to update stage:', error);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) return <LoadingSpinner message="Loading work queue..." />;

  const myOrders = orders.filter(o => o.assignedEngineerId === currentUserId && o.currentStage !== 'completed');
  const unassignedOrders = orders.filter(o => !o.assignedEngineerId);
  const completedOrders = orders.filter(o => o.currentStage === 'completed');

  return (
    <div className="engineer-dashboard">
      <h1>Work Queue</h1>

      {/* Pending Bookings */}
      {pendingBookings.length > 0 && (
        <section className="section">
          <h2>New Bookings ({pendingBookings.length})</h2>
          <p style={{ color: '#6b7280', marginBottom: '1rem' }}>These customers are waiting for service. Accept to start working on them.</p>
          <div className="order-list">
            {pendingBookings.map(booking => (
              <div key={booking.id} className="order-card">
                <div className="order-header">
                  <h3>{(booking.serviceType || '').replace(/_/g, ' ')}</h3>
                  <span className={`status-badge status-${booking.status}`}>{booking.status}</span>
                </div>
                <p>Preferred date: {booking.preferredDate ? new Date(booking.preferredDate).toLocaleDateString() : '-'}</p>
                {booking.description && <p>Notes: {booking.description}</p>}
                <div className="order-stage" style={{ marginTop: '0.75rem' }}>
                  <span className="stage-label">Booked: {new Date(booking.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => acceptBooking(booking.id)}
                    disabled={updating === booking.id}
                    className="btn btn-primary btn-sm"
                  >
                    {updating === booking.id ? 'Accepting...' : 'Accept & Take Job'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Unassigned Orders */}
      {unassignedOrders.length > 0 && (
        <section className="section">
          <h2>Unassigned Jobs ({unassignedOrders.length})</h2>
          <div className="order-list">
            {unassignedOrders.map(order => (
              <div key={order.id} className={`order-card priority-${order.priority || 'normal'}`}>
                <div className="order-header">
                  <Link to={`/service-orders/${order.id}`}>
                    <h3>Order #{order.id.slice(0, 8)}</h3>
                  </Link>
                  <span className={`priority-badge priority-${order.priority || 'normal'}`}>{order.priority || 'normal'}</span>
                </div>
                <p>Stage: {(order.currentStage || '').replace(/_/g, ' ')}</p>
                <div className="order-stage">
                  <span className="stage-label">Created: {new Date(order.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={() => takeJob(order.id)}
                    disabled={updating === order.id}
                    className="btn btn-primary btn-sm"
                  >
                    {updating === order.id ? 'Assigning...' : 'Take This Job'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* My Active Orders */}
      <section className="section">
        <h2>My Active Orders ({myOrders.length})</h2>
        {myOrders.length === 0 ? (
          <p className="empty-state">No active orders in your queue.</p>
        ) : (
          <div className="order-list">
            {myOrders.map(order => (
              <div key={order.id} className={`order-card priority-${order.priority || 'normal'}`}>
                <div className="order-header">
                  <Link to={`/service-orders/${order.id}`}>
                    <h3>Order #{order.id.slice(0, 8)}</h3>
                  </Link>
                  <span className={`priority-badge priority-${order.priority || 'normal'}`}>{order.priority || 'normal'}</span>
                </div>
                <p>Stage: <strong>{(order.currentStage || '').replace(/_/g, ' ')}</strong></p>
                <div className="order-stage">
                  <span className="stage-label">Current: {(order.currentStage || '').replace(/_/g, ' ')}</span>
                  {order.currentStage !== 'completed' && (
                    <button
                      onClick={() => advanceStage(order.id, order.currentStage, order.serviceType || 'other')}
                      disabled={updating === order.id}
                      className="btn btn-primary btn-sm"
                    >
                      {updating === order.id ? 'Updating...' : `Advance to ${getNextStage(order.serviceType || 'other', order.currentStage)?.replace(/_/g, ' ') || ''}`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed */}
      {completedOrders.length > 0 && (
        <section className="section">
          <h2>Completed ({completedOrders.length})</h2>
          <div className="order-list">
            {completedOrders.slice(0, 5).map(order => (
              <div key={order.id} className="order-card completed">
                <h3>Order #{order.id.slice(0, 8)}</h3>
                <p>Completed: {order.completedAt ? new Date(order.completedAt).toLocaleDateString() : '-'}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default EngineerDashboard;
