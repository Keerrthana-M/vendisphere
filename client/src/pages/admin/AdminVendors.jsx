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
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading vendor applications...</p>
      </div>
    )
  }

  return (
    <div className="admin-vendors-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Vendor Management & Approvals</h1>
          <p className="page-subtitle">Approve or reject vendor storefront applications on VendiSphere.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {vendors.length > 0 ? (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Owner Name</th>
                <th>Email</th>
                <th>Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map(v => (
                <tr key={v._id}>
                  <td><strong>{v.businessName}</strong></td>
                  <td>{v.user?.name || 'N/A'}</td>
                  <td>{v.user?.email || 'N/A'}</td>
                  <td>{v.description || 'No description provided'}</td>
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
                        Approve
                      </button>
                    )}

                    {v.approvalStatus !== 'rejected' && (
                      <button 
                        onClick={() => handleReject(v._id)}
                        disabled={actionId === v._id}
                        className="btn-danger btn-sm"
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-results">
          <h2>No vendor accounts registered</h2>
        </div>
      )}
    </div>
  )
}
