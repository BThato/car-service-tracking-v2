import { useState, useEffect, FormEvent } from 'react';
import { client } from '../client';
import LoadingSpinner from '../components/LoadingSpinner';

function VehiclesPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    make: '', model: '', year: '', licensePlate: '', vin: '', color: '', mileage: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadVehicles(); }, []);

  const loadVehicles = async () => {
    try {
      const { data } = await client.models.Vehicle.list();
      setVehicles(data || []);
    } catch (error) {
      console.error('Failed to load vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await client.models.Vehicle.create({
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        licensePlate: formData.licensePlate,
        vin: formData.vin || undefined,
        color: formData.color || undefined,
        mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
      });
      setShowForm(false);
      setFormData({ make: '', model: '', year: '', licensePlate: '', vin: '', color: '', mileage: '' });
      loadVehicles();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to add vehicle.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this vehicle?')) return;
    try {
      await client.models.Vehicle.delete({ id });
      loadVehicles();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
    }
  };

  if (loading) return <LoadingSpinner message="Loading vehicles..." />;

  return (
    <div className="vehicles-page">
      <div className="page-header">
        <h1>My Vehicles</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : '+ Add Vehicle'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="vehicle-form card">
          {error && <div className="alert alert-error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="make">Make</label>
              <input id="make" name="make" value={formData.make} onChange={handleChange} required placeholder="e.g. Toyota" />
            </div>
            <div className="form-group">
              <label htmlFor="model">Model</label>
              <input id="model" name="model" value={formData.model} onChange={handleChange} required placeholder="e.g. Camry" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="year">Year</label>
              <input id="year" name="year" type="number" value={formData.year} onChange={handleChange} required min="1900" max="2030" />
            </div>
            <div className="form-group">
              <label htmlFor="licensePlate">License Plate</label>
              <input id="licensePlate" name="licensePlate" value={formData.licensePlate} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input id="color" name="color" value={formData.color} onChange={handleChange} placeholder="e.g. Silver" />
            </div>
            <div className="form-group">
              <label htmlFor="mileage">Mileage</label>
              <input id="mileage" name="mileage" type="number" value={formData.mileage} onChange={handleChange} min="0" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="vin">VIN (optional)</label>
            <input id="vin" name="vin" value={formData.vin} onChange={handleChange} />
          </div>
          <button type="submit" className="btn btn-primary">Add Vehicle</button>
        </form>
      )}

      {vehicles.length === 0 ? (
        <p className="empty-state">No vehicles yet. Add your first vehicle to get started!</p>
      ) : (
        <div className="card-grid">
          {vehicles.map(vehicle => (
            <div key={vehicle.id} className="card">
              <div className="card-header">
                <h3>{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                <button onClick={() => handleDelete(vehicle.id)} className="btn btn-danger btn-sm">Remove</button>
              </div>
              <p>License: {vehicle.licensePlate}</p>
              {vehicle.color && <p>Color: {vehicle.color}</p>}
              {vehicle.mileage && <p>Mileage: {vehicle.mileage.toLocaleString()} km</p>}
              {vehicle.vin && <p>VIN: {vehicle.vin}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VehiclesPage;
