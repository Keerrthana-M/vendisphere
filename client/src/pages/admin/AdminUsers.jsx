import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/admin/users')
      .then(data => setUsers(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="admin-users-container animate-fade-up">
        <h1 className="page-title">Registered Accounts</h1>
        <div className="skeleton-card" style={{ height: '300px', marginTop: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-users-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">USER DIRECTORY</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>Registered Accounts</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            All customers, multi-vendor merchants, and platform administrators on VendiSphere.
          </p>
        </div>

        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Total <strong>{users.length}</strong> active account{users.length === 1 ? '' : 's'}
        </span>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email Address</th>
              <th>Assigned Role</th>
              <th>Account ID</th>
              <th>Registered On</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.82rem' }}>
                      {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <strong style={{ color: '#0f172a' }}>{u.name}</strong>
                  </div>
                </td>
                <td>
                  <span style={{ color: '#475569' }}>{u.email}</span>
                </td>
                <td>
                  <span className={`user-badge badge-${u.role}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    #{u._id.substring(u._id.length - 8).toUpperCase()}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
