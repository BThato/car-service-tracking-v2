import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../client';
import LoadingSpinner from '../components/LoadingSpinner';

function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { loadBookings(); }, []);

  // Real-time updates
  useEffect(() => {
    const sub = client.models.Booking.observeQuery().subscribe({
      next: ({ items }) => {
        setBookings(items);
        setLoading(false);
      },
      error: (err) => console.error('Booking subscription error:', err),
    });
    return () => sub.unsubscribe();
  }, []);

  const loadBookings = async () => {
    try {
      const { data } = await client.models.Booking.list();
      setBookings(data || []);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setError('');
    try {
      // Re-fetch to check current status (in case engineer already accepted)
      const { data: current } = await client.models.Booking.get({ id });
      if (current?.status !== 'pending') {
        setError('This booking has already been accepted and cannot be cancelled.');
        // Refresh the list to show updated status
        loadBookings();
        return;
      }
      await client.models.Booking.update({
        id,
        status: 'cancelled' as any,
        cancellationReason: 'Cancelled by customer',
      });
      setSuccess('Booking cancelled.');
      loadBookings();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to cancel.');
    }
  };

  if (loading) return <LoadingSpinner message="Loading bookings..." />;

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="my-bookings-page page-loaded">
      <div className="page-header">
        <h1>My Bookings</h1>
        <Link to="/bookings/new" className="btn btn-primary">+ New Booking</Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {bookings.length === 0 ? (
        <div className="empty-state">
          <p>No bookings yet. <Link to="/bookings/new">Book your first service!</Link></p>
        </div>
      ) : (
        <>
          {pendingBookings.length > 0 && (
            <section className="section">
              <h2>Pending ({pendingBookings.length})</h2>
              <div className="card-grid">
                {pendingBookings.map(b => (
                  <div key={b.id} className="card">
                    <div className="card-header">
                      <h3>{(b.serviceType || '').replace(/_/g, ' ')}</h3>
                      <span className="status-badge status-pending">Pending</span>
                    </div>
                    <p><strong>Date:</strong> {b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : '-'}</p>
                    {b.preferredTime && <p><strong>Time:</strong> {b.preferredTime}</p>}
                    {b.description && <p><strong>Notes:</strong> {b.description}</p>}
                    <div className="btn-group" style={{ marginTop: '1rem' }}>
                      <button onClick={() => cancelBooking(b.id)} className="btn btn-danger btn-sm">
                        Cancel Booking
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {confirmedBookings.length > 0 && (
            <section className="section">
              <h2>Confirmed ({confirmedBookings.length})</h2>
              <div className="card-grid">
                {confirmedBookings.map(b => (
                  <div key={b.id} className="card">
                    <div className="card-header">
                      <h3>{(b.serviceType || '').replace(/_/g, ' ')}</h3>
                      <span className="status-badge status-confirmed">Confirmed</span>
                    </div>
                    <p><strong>Date:</strong> {b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : '-'}</p>
                    {b.preferredTime && <p><strong>Time:</strong> {b.preferredTime}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {completedBookings.length > 0 && (
            <section className="section">
              <h2>Completed ({completedBookings.length})</h2>
              <div className="card-grid">
                {completedBookings.map(b => (
                  <div key={b.id} className="card">
                    <div className="card-header">
                      <h3>{(b.serviceType || '').replace(/_/g, ' ')}</h3>
                      <span className="status-badge status-completed">Completed</span>
                    </div>
                    <p><strong>Date:</strong> {b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : '-'}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {cancelledBookings.length > 0 && (
            <section className="section">
              <h2>Cancelled ({cancelledBookings.length})</h2>
              <div className="card-grid">
                {cancelledBookings.map(b => (
                  <div key={b.id} className="card" style={{ opacity: 0.6 }}>
                    <div className="card-header">
                      <h3>{(b.serviceType || '').replace(/_/g, ' ')}</h3>
                      <span className="status-badge status-cancelled">Cancelled</span>
                    </div>
                    <p><strong>Date:</strong> {b.preferredDate ? new Date(b.preferredDate).toLocaleDateString() : '-'}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default MyBookingsPage;
