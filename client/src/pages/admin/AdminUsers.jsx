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
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading platform users...</p>
      </div>
    )
  }

  return (
    <div className="admin-users-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Registered Accounts</h1>
          <p className="page-subtitle">All customers, vendors, and admin accounts registered on VendiSphere.</p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Email Address</th>
              <th>Role</th>
              <th>Registration Date</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>
                  <span className={`user-badge badge-${u.role}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
