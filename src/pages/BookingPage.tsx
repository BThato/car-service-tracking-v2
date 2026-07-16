import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { client } from '../client';

function BookingPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    vehicleId: '',
    serviceType: '',
    description: '',
    preferredDate: '',
    preferredTime: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { loadVehicles(); }, []);

  const loadVehicles = async () => {
    try {
      const { data } = await client.models.Vehicle.list();
      setVehicles(data || []);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await client.models.Booking.create({
        vehicleId: formData.vehicleId,
        serviceType: formData.serviceType as any,
        description: formData.description || undefined,
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime || undefined,
        status: 'pending' as any,
      });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError((err as Error).message || 'Booking failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <h1>Book a Service</h1>

      {vehicles.length === 0 ? (
        <div className="alert alert-info">
          You need to add a vehicle first. <Link to="/vehicles">Add Vehicle</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="booking-form">
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="vehicleId">Select Vehicle</label>
            <select id="vehicleId" name="vehicleId" value={formData.vehicleId} onChange={handleChange} required>
              <option value="">Choose a vehicle...</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model} ({v.licensePlate})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="serviceType">Service Type</label>
            <select id="serviceType" name="serviceType" value={formData.serviceType} onChange={handleChange} required>
              <option value="">Select service type...</option>
              <option value="oil_change">Oil Change</option>
              <option value="brake_service">Brake Service</option>
              <option value="tire_rotation">Tire Rotation</option>
              <option value="engine_repair">Engine Repair</option>
              <option value="transmission">Transmission Service</option>
              <option value="electrical">Electrical System</option>
              <option value="body_work">Body Work</option>
              <option value="full_service">Full Service</option>
              <option value="inspection">Inspection</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the issue or service needed..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="preferredDate">Preferred Date</label>
              <input
                id="preferredDate"
                name="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="form-group">
              <label htmlFor="preferredTime">Preferred Time (optional)</label>
              <input
                id="preferredTime"
                name="preferredTime"
                type="time"
                value={formData.preferredTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading ? 'Booking...' : 'Book Service'}
          </button>
        </form>
      )}
    </div>
  );
}

export default BookingPage;
