import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { client } from '../client';
import StageTracker from '../components/StageTracker';
import LoadingSpinner from '../components/LoadingSpinner';
import { getNextStage } from '../config/serviceStages';

function TrackingPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [booking, setBooking] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('customer');
  const [advanceNotes, setAdvanceNotes] = useState('');
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  // Real-time: observe the service order for live stage updates
  useEffect(() => {
    if (!id) return;

    const sub = client.models.ServiceOrder.observeQuery({
      filter: { id: { eq: id } },
    }).subscribe({
      next: ({ items }) => {
        if (items.length > 0) {
          setOrder(items[0]);
        }
      },
      error: (err) => console.error('ServiceOrder observe error:', err),
    });

    return () => sub.unsubscribe();
  }, [id]);

  // Real-time: observe stage updates for this order
  useEffect(() => {
    if (!id) return;

    const sub = client.models.StageUpdate.observeQuery({
      filter: { serviceOrderId: { eq: id } },
    }).subscribe({
      next: ({ items }) => {
        const sorted = [...items].sort((a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setHistory(sorted);
      },
      error: (err) => console.error('StageUpdate observe error:', err),
    });

    return () => sub.unsubscribe();
  }, [id]);

  const loadData = async () => {
    try {
      const [attrs, orderRes] = await Promise.all([
        fetchUserAttributes(),
        client.models.ServiceOrder.get({ id: id! }),
      ]);
      setRole(attrs['custom:role'] || 'customer');
      setOrder(orderRes.data);

      // Fetch the related booking for service type info
      if (orderRes.data?.bookingId) {
        const bookingRes = await client.models.Booking.get({ id: orderRes.data.bookingId });
        setBooking(bookingRes.data);
      }
    } catch (error) {
      console.error('Failed to load tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStage = async () => {
    if (!order) return;
    const serviceType = booking?.serviceType || 'other';
    const nextStage = getNextStage(serviceType, order.currentStage);
    if (!nextStage) return;

    setAdvancing(true);
    try {
      const currentStage = order.currentStage;
      const updateData: any = { id: order.id, currentStage: nextStage };
      if (nextStage === 'completed') {
        updateData.completedAt = new Date().toISOString();
      }
      if (currentStage === 'queued') {
        updateData.startedAt = new Date().toISOString();
      }
      const result = await client.models.ServiceOrder.update(updateData);
      if (result.errors) {
        console.error('Update errors:', result.errors);
      }

      // Create a StageUpdate record for history
      await client.models.StageUpdate.create({
        serviceOrderId: order.id,
        updatedById: 'engineer',
        fromStage: currentStage,
        toStage: nextStage,
        notes: advanceNotes || undefined,
      });

      setAdvanceNotes('');
      loadData();
    } catch (error) {
      console.error('Failed to advance stage:', error);
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading service details..." />;
  if (!order) return <div className="alert alert-error">Service order not found.</div>;

  const serviceType = booking?.serviceType || 'other';
  const isEngineer = role === 'engineer' || role === 'admin';

  return (
    <div className="tracking-page">
      <div className="page-header">
        <h1>Service Tracking</h1>
        <span className={`priority-badge priority-${order.priority || 'normal'}`}>
          {order.priority || 'normal'}
        </span>
      </div>

      {/* Order Info */}
      <div className="card">
        <h3>{serviceType.replace(/_/g, ' ')}</h3>
        <p>Current Stage: <strong>{(order.currentStage || '').replace(/_/g, ' ')}</strong></p>
        {order.notes && <p>Notes: {order.notes}</p>}
        {order.startedAt && <p>Started: {new Date(order.startedAt).toLocaleString()}</p>}
      </div>

      {/* Stage Progress */}
      <section className="section">
        <h2>Current Progress</h2>
        <StageTracker currentStage={order.currentStage || 'queued'} serviceType={serviceType} />
        {order.currentStage === 'completed' && (
          <div className="alert alert-success">
            Your vehicle is ready for pickup!
          </div>
        )}

        {/* Engineer: Advance Stage */}
        {isEngineer && order.currentStage !== 'completed' && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f0f9ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <textarea
                value={advanceNotes}
                onChange={(e) => setAdvanceNotes(e.target.value)}
                placeholder="Add notes for this stage (optional)..."
                rows={2}
                style={{ width: '100%', resize: 'vertical' }}
              />
            </div>
            <button
              onClick={handleAdvanceStage}
              disabled={advancing}
              className="btn btn-primary"
            >
              {advancing ? 'Advancing...' : `Advance to: ${getNextStage(serviceType, order.currentStage)?.replace(/_/g, ' ')}`}
            </button>
          </div>
        )}
      </section>

      {/* Timeline */}
      <section className="section">
        <h2>Update History</h2>
        {history.length === 0 ? (
          <p className="empty-state">No updates yet.</p>
        ) : (
          <div className="timeline">
            {history.map((entry: any) => (
              <div key={entry.id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <strong>{(entry.toStage || '').replace(/_/g, ' ')}</strong>
                  {entry.fromStage && <p>From: {entry.fromStage.replace(/_/g, ' ')}</p>}
                  {entry.notes && <p className="timeline-notes">{entry.notes}</p>}
                  <time>{new Date(entry.createdAt).toLocaleString()}</time>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TrackingPage;
