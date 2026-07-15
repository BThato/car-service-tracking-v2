import { useState, useEffect } from 'react';
import { client } from '../client';
import LoadingSpinner from '../components/LoadingSpinner';

function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const { data } = await client.models.User.list();
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    try {
      await client.models.User.update({
        id: userId,
        role: newRole as any,
      });
      setSuccess(`Role updated to ${newRole}`);
      loadUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const deactivateUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await client.models.User.update({
        id: userId,
        isActive: false,
      });
      loadUsers();
    } catch (error) {
      console.error('Failed to deactivate user:', error);
    }
  };

  if (loading) return <LoadingSpinner message="Loading users..." />;

  const engineers = users.filter(u => u.role === 'engineer');
  const customers = users.filter(u => u.role === 'customer');
  const admins = users.filter(u => u.role === 'admin');

  return (
    <div className="admin-users-page">
      <div className="page-header">
        <h1>User Management</h1>
      </div>

      {success && <div className="alert alert-success">{success}</div>}

      {/* Engineers */}
      <section className="section">
        <h2>Engineers ({engineers.length})</h2>
        {engineers.length === 0 ? (
          <p className="empty-state">No engineers yet.</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {engineers.map(user => (
                  <tr key={user.id}>
                    <td>{user.firstName} {user.lastName}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`status-badge ${user.isActive !== false ? 'status-confirmed' : 'status-cancelled'}`}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => deactivateUser(user.id)} className="btn btn-danger btn-sm">Deactivate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Admins */}
      <section className="section">
        <h2>Admins ({admins.length})</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th></tr>
            </thead>
            <tbody>
              {admins.map(user => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Customers */}
      <section className="section">
        <h2>Customers ({customers.length})</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {customers.map(user => (
                <tr key={user.id}>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`status-badge ${user.isActive !== false ? 'status-confirmed' : 'status-cancelled'}`}>
                      {user.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user.id, e.target.value)}
                      style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid #d1d5db' }}
                    >
                      <option value="customer">Customer</option>
                      <option value="engineer">Engineer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default AdminUsersPage;
