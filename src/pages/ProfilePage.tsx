import { useState, useEffect } from 'react';
import { fetchUserAttributes, updateUserAttributes } from 'aws-amplify/auth';
import { useAuthenticator } from '@aws-amplify/ui-react';

function ProfilePage() {
  const { signOut } = useAuthenticator();
  const [attrs, setAttrs] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ given_name: '', family_name: '', phone_number: '' });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const attributes = await fetchUserAttributes();
      setAttrs(attributes as Record<string, string>);
      setFormData({
        given_name: attributes.given_name || '',
        family_name: attributes.family_name || '',
        phone_number: attributes.phone_number || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    try {
      await updateUserAttributes({
        userAttributes: {
          given_name: formData.given_name,
          family_name: formData.family_name,
          phone_number: formData.phone_number || undefined,
        },
      });
      setSuccess('Profile updated successfully.');
      setEditing(false);
      loadProfile();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to update profile.');
    }
  };

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <button onClick={() => setEditing(!editing)} className="btn btn-outline">
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        {editing ? (
          <>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="given_name">First Name</label>
                <input
                  id="given_name"
                  value={formData.given_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, given_name: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label htmlFor="family_name">Last Name</label>
                <input
                  id="family_name"
                  value={formData.family_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, family_name: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="phone_number">Phone</label>
              <input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
                placeholder="+27 82 123 4567"
              />
            </div>
            <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
          </>
        ) : (
          <>
            <p><strong>Name:</strong> {attrs.given_name} {attrs.family_name}</p>
            <p><strong>Email:</strong> {attrs.email}</p>
            <p><strong>Phone:</strong> {attrs.phone_number || 'Not set'}</p>
            <p><strong>Role:</strong> <span className="role-badge">{attrs['custom:role'] || 'customer'}</span></p>
          </>
        )}
      </div>

      <div style={{ marginTop: '2rem' }}>
        <button onClick={signOut} className="btn btn-danger">Sign Out</button>
      </div>
    </div>
  );
}

export default ProfilePage;
