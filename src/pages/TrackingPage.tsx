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
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('customer');
  const [advanceNotes, setAdvanceNotes] = useState('');
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  // Subscribe to real-time updates on this service order
  useEffect(() => {
    if (!id) return;

    const sub = client.models.ServiceOrder.onUpdate({
      filter: { id: { eq: id } },
    }).subscribe({
      next: (updatedOrder) => {
        setOrder((prev: any) => prev ? { ...prev, ...updatedOrder } : updatedOrder);
        loadHistory();
      },
      error: (err) => console.error('Subscription error:', err),
    });

    return () => sub.unsubscribe();
  }, [id]);

  // Subscribe to new stage updates for this order
  useEffect(() => {
    if (!id) return;

    const sub = client.models.StageUpdate.onCreate({
      filter: { serviceOrderId: { eq: id } },
    }).subscribe({
      next: (newUpdate) => {
        setHistory(prev => [newUpdate, ...prev]);
        // Update the order's current stage from the new update
        if (newUpdate.toStage) {
          setOrder((prev: any) => prev ? { ...prev, currentStage: newUpdate.toStage } : prev);
        }
      },
      error: (err) => console.error('StageUpdate subscription error:', err),
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
      await loadHistory();
    } catch (error) {
      console.error('Failed to load tracking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await client.models.StageUpdate.list({
        filter: { serviceOrderId: { eq: id! } },
      });
      // Sort by createdAt descending
      const sorted = (data || []).sort((a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setHistory(sorted);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleAdvanceStage = async () => {
    if (!order) return;
    const nextStage = getNextStage(order.serviceType || 'other', order.currentStage);
    if (!nextStage) return;

    setAdvancing(true);
    try {
      // Use custom mutation for stage advancement (handles validation)
      await client.mutations.advanceStage({
        serviceOrderId: order.id,
        notes: advanceNotes || undefined,
      });
      setAdvanceNotes('');
      // Subscription will handle UI update
    } catch (error) {
      console.error('Failed to advance stage:', error);
      // Fallback: reload manually
      loadData();
    } finally {
      setAdvancing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading service details..." />;
  if (!order) return <div className="alert alert-error">Service order not found.</div>;

  const serviceType = order.serviceType || 'other';
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
        <h3>Service Order</h3>
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
