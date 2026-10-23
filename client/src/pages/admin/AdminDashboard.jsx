import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { formatINR } from '../../utils/formatINR'

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/admin/analytics')
      .then(data => setAnalytics(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading platform oversight metrics...</p>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Platform Administration</h1>
          <p className="page-subtitle">Master oversight of customers, vendors, products, and orders.</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-title">Total Platform Revenue</span>
          <span className="metric-value">{formatINR(analytics?.totalPlatformRevenue || 0)}</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Registered Customers</span>
          <span className="metric-value">{analytics?.totalCustomers || 0}</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Approved Vendors</span>
          <span className="metric-value">{analytics?.approvedVendors || 0}</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Pending Approvals</span>
          <span className={`metric-value ${analytics?.pendingVendors > 0 ? 'text-warning' : ''}`}>
            {analytics?.pendingVendors || 0}
          </span>
        </div>
      </div>

      <div className="dashboard-quick-links">
        <Link to="/admin/vendors" className="quick-link-card">
          <h3>🏪 Vendor Approvals ({analytics?.pendingVendors || 0} Pending)</h3>
          <p>Review vendor applications and approve or reject storefront access.</p>
        </Link>

        <Link to="/admin/users" className="quick-link-card">
          <h3>👥 Registered Users</h3>
          <p>View all platform user accounts, roles, and registration dates.</p>
        </Link>

        <Link to="/admin/products" className="quick-link-card">
          <h3>📦 Marketplace Catalog</h3>
          <p>Monitor all products uploaded by multi-vendor stores.</p>
        </Link>

        <Link to="/admin/orders" className="quick-link-card">
          <h3>🚚 Platform Orders</h3>
          <p>Track all customer purchase transactions across all vendors.</p>
        </Link>
      </div>
    </div>
  )
}
