import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'

export default function AdminVendors() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionId, setActionId] = useState(null)

  const fetchVendors = async () => {
    setLoading(true)
    try {
      const data = await apiRequest('/admin/vendors')
      setVendors(data)
    } catch (err) {
      setError(err.message || 'Failed to load vendors')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchVendors()
  }, [])

  const handleApprove = async (id) => {
    setActionId(id)
    try {
      await apiRequest(`/admin/vendors/${id}/approve`, 'PUT')
      setVendors(vendors.map(v => v._id === id ? { ...v, approvalStatus: 'approved' } : v))
    } catch (err) {
      alert(err.message || 'Failed to approve vendor')
    } finally {
      setActionId(null)
    }
  }

  const handleReject = async (id) => {
    setActionId(id)
    try {
      await apiRequest(`/admin/vendors/${id}/reject`, 'PUT')
      setVendors(vendors.map(v => v._id === id ? { ...v, approvalStatus: 'rejected' } : v))
    } catch (err) {
      alert(err.message || 'Failed to reject vendor')
    } finally {
      setActionId(null)
    }
  }

  if (loading) {
    return (
      <div className="admin-vendors-container animate-fade-up">
        <h1 className="page-title">Vendor Approvals & Management</h1>
        <div className="skeleton-card" style={{ height: '320px', marginTop: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    )
  }

  const pendingCount = vendors.filter(v => v.approvalStatus === 'pending').length

  return (
    <div className="admin-vendors-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">MERCHANT GOVERNANCE</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>Vendor Management &amp; Approvals</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Review merchant storefront registrations and grant or revoke marketplace catalog privileges.
          </p>
        </div>

        {pendingCount > 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '8px 14px', borderRadius: '12px', fontSize: '0.88rem', color: '#b45309', fontWeight: 600 }}>
            ⏳ {pendingCount} application{pendingCount === 1 ? '' : 's'} waiting for approval
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {vendors.length > 0 ? (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Storefront / Business</th>
                <th>Owner Name</th>
                <th>Email Address</th>
                <th>Store Description</th>
                <th>Approval Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v._id}>
                  <td>
                    <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{v.businessName}</strong>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
                      Ref: #{v._id.substring(v._id.length - 6).toUpperCase()}
                    </span>
                  </td>
                  <td>{v.user?.name || 'N/A'}</td>
                  <td>
                    <span style={{ color: '#64748b' }}>{v.user?.email || 'N/A'}</span>
                  </td>
                  <td>
                    <p style={{ margin: 0, fontSize: '0.86rem', color: '#475569', maxWidth: '280px', lineHeight: 1.4 }}>
                      {v.description || 'No description provided.'}
                    </p>
                  </td>
                  <td>
                    <span className={`status-badge status-${v.approvalStatus}`}>
                      {v.approvalStatus.toUpperCase()}
                    </span>
                  </td>
                  <td className="action-buttons-cell">
                    {v.approvalStatus !== 'approved' && (
                      <button 
                        onClick={() => handleApprove(v._id)}
                        disabled={actionId === v._id}
                        className="btn-success btn-sm"
                      >
                        {actionId === v._id ? 'Saving...' : '✓ Approve'}
                      </button>
                    )}

                    {v.approvalStatus !== 'rejected' && (
                      <button 
                        onClick={() => handleReject(v._id)}
                        disabled={actionId === v._id}
                        className="btn-danger btn-sm"
                      >
                        {actionId === v._id ? 'Saving...' : '✕ Reject'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-results" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
            🏪
          </div>
          <h2>No vendor accounts registered yet</h2>
          <p>When merchants apply for storefront access, their applications will appear here for review.</p>
        </div>
      )}
    </div>
  )
}
