import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchUserAttributes } from 'aws-amplify/auth';
import { client } from '../client';
import StageTracker from '../components/StageTracker';
import LoadingSpinner from '../components/LoadingSpinner';
import { getNextStage } from '../config/serviceStages';

function ServiceOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const [role, setRole] = useState('customer');

  useEffect(() => { loadOrder(); }, [id]);

  const loadOrder = async () => {
    try {
      const [attrs, orderRes] = await Promise.all([
        fetchUserAttributes(),
        client.models.ServiceOrder.get({ id: id! }),
      ]);
      setRole(attrs['custom:role'] || 'customer');
      setOrder(orderRes.data);
    } catch (error) {
      console.error('Failed to load order:', error);
    } finally {
      setLoading(false);
    }
  };

  const advanceStage = async () => {
    if (!order) return;
    try {
      await client.mutations.advanceStage({
        serviceOrderId: order.id,
        notes: notes || undefined,
      });
      setNotes('');
      setSuccess(`Stage advanced successfully`);
      loadOrder();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to advance stage:', error);
    }
  };

  const addNotes = async () => {
    if (!notes.trim()) return;
    try {
      const existingNotes = order.notes || '';
      const timestamp = new Date().toLocaleString();
      const updatedNotes = existingNotes
        ? `${existingNotes}\n[${timestamp}] ${notes}`
        : `[${timestamp}] ${notes}`;

      await client.models.ServiceOrder.update({
        id: order.id,
        notes: updatedNotes,
      });
      setNotes('');
      setSuccess('Notes added successfully.');
      loadOrder();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to add notes:', error);
    }
  };

  if (loading) return <LoadingSpinner message="Loading service order..." />;
  if (!order) return <div className="alert alert-error">Service order not found.</div>;

  const isEngineer = role === 'engineer' || role === 'admin';
  const serviceType = order.serviceType || 'other';

  return (
    <div className="service-order-page">
      <h1>Service Order Details</h1>

      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <h2>Order #{order.id.slice(0, 8)}</h2>
        <p>Stage: <strong>{(order.currentStage || '').replace(/_/g, ' ')}</strong></p>
        <p>Priority: <span className={`priority-badge priority-${order.priority || 'normal'}`}>{order.priority || 'normal'}</span></p>
        {order.startedAt && <p>Started: {new Date(order.startedAt).toLocaleString()}</p>}
        {order.completedAt && <p>Completed: {new Date(order.completedAt).toLocaleString()}</p>}
      </div>

      <section className="section">
        <h2>Progress</h2>
        <StageTracker currentStage={order.currentStage || 'queued'} serviceType={serviceType} />
      </section>

      {/* Engineer controls */}
      {isEngineer && order.currentStage !== 'completed' && (
        <section className="section">
          <h2>Update Service</h2>
          <div className="form-group">
            <label htmlFor="notes">Notes / Issues</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Log notes, issues, or observations about this stage..."
              rows={3}
            />
          </div>
          <div className="btn-group">
            <button onClick={advanceStage} className="btn btn-primary">
              Advance to: {getNextStage(serviceType, order.currentStage)?.replace(/_/g, ' ') || 'N/A'}
            </button>
            <button onClick={addNotes} className="btn btn-outline" disabled={!notes.trim()}>
              Add Notes Only
            </button>
          </div>
        </section>
      )}

      {/* Service Notes */}
      {order.notes && (
        <section className="section">
          <h2>Service Notes</h2>
          <pre className="notes-block">{order.notes}</pre>
        </section>
      )}
    </div>
  );
}

export default ServiceOrderPage;
