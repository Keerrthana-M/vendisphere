import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatINR'

export default function VendorDashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  const isPending = user?.vendorProfile?.approvalStatus === 'pending'
  const isRejected = user?.vendorProfile?.approvalStatus === 'rejected'

  useEffect(() => {
    if (!isPending && !isRejected) {
      apiRequest('/vendor/analytics')
        .then(data => setAnalytics(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [isPending, isRejected])

  if (loading) {
    return (
      <div className="dashboard-container animate-fade-up">
        <h1 className="page-title">Vendor Portal</h1>
        <div className="metrics-grid" style={{ marginTop: '1.5rem' }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="skeleton-card" style={{ height: '110px', padding: '1.25rem' }}>
              <div className="skeleton-shimmer skeleton-pill" style={{ marginBottom: '0.75rem' }}></div>
              <div className="skeleton-shimmer skeleton-title" style={{ width: '50%' }}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">MERCHANT MANAGEMENT CONSOLE</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>
            {user?.vendorProfile?.businessName || 'Vendor Portal'}
          </h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Store Manager: <strong>{user?.name}</strong> • Real-time catalog & inventory intelligence
          </p>
        </div>

        {!isPending && !isRejected && (
          <Link to="/vendor/products/new" className="btn-primary">
            + Add New Product
          </Link>
        )}
      </div>

      {/* Pending Approval Notice */}
      {isPending && (
        <div className="notice-card warning-notice">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.25rem' }}>⏳</span>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Storefront Application Under Review</h3>
          </div>
          <p style={{ margin: 0, lineHeight: 1.6, color: '#78350f' }}>
            Your vendor application for <strong>"{user?.vendorProfile?.businessName || 'Your Store'}"</strong> has been received and is awaiting approval by VendiSphere platform administrators. Once approved, you can immediately publish products, receive customer orders, and track sales analytics.
          </p>
        </div>
      )}

      {/* Rejected Notice */}
      {isRejected && (
        <div className="notice-card error-notice">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.25rem' }}>❌</span>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Storefront Status: Application Declined</h3>
          </div>
          <p style={{ margin: 0, lineHeight: 1.6, color: '#991b1b' }}>
            Your vendor storefront registration has not been approved for public marketplace catalog listing at this time. Please contact support@vendisphere.com for assistance.
          </p>
        </div>
      )}

      {/* Approved Vendor Dashboard Overview */}
      {!isPending && !isRejected && (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-title">Gross Store Revenue</span>
              <span className="metric-value">{formatINR(analytics?.totalRevenue || 0)}</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Excludes cancelled transactions</span>
            </div>

            <div className="metric-card">
              <span className="metric-title">Orders Received</span>
              <span className="metric-value">{analytics?.totalOrders || 0}</span>
              <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Active customer purchases</span>
            </div>

            <div className="metric-card">
              <span className="metric-title">Products Listed</span>
              <span className="metric-value">{analytics?.totalProducts || 0}</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>In marketplace catalog</span>
            </div>

            <div className="metric-card">
              <span className="metric-title">Low Stock Alerts</span>
              <span className={`metric-value ${analytics?.lowStockCount > 0 ? 'text-warning' : ''}`}>
                {analytics?.lowStockCount || 0}
              </span>
              <span style={{ fontSize: '0.78rem', color: analytics?.lowStockCount > 0 ? '#dc2626' : '#10b981', fontWeight: 600 }}>
                {analytics?.lowStockCount > 0 ? 'Requires restock attention' : 'All stock levels healthy'}
              </span>
            </div>
          </div>

          <div className="dashboard-quick-links">
            <Link to="/vendor/products" className="quick-link-card">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '4px' }}>
                📦
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Manage Catalog</h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Add new products, adjust pricing, edit stock quantities, or unlist items.
              </p>
            </Link>

            <Link to="/vendor/inventory" className="quick-link-card">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '4px' }}>
                📊
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Smart Velocity Inventory</h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Auto-calculated 14-day stockout predictions and suggested replenishment buffers.
              </p>
            </Link>

            <Link to="/vendor/orders" className="quick-link-card">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '4px' }}>
                🚚
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Customer Orders</h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Track incoming purchases, verify shipping addresses, and update fulfillment statuses.
              </p>
            </Link>

            <Link to="/vendor/insights" className="quick-link-card">
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '4px' }}>
                ✨
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>AI Business Insights</h3>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
                Automated intelligent suggestions for inventory reordering and growth optimization.
              </p>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
