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

  return (
    <div className="dashboard-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Vendor Portal</h1>
          <p className="page-subtitle">Welcome back, {user?.name}!</p>
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
          <h3>⏳ Vendor Account Approval Pending</h3>
          <p>
            Your vendor application for <strong>"{user?.vendorProfile?.businessName || 'Your Store'}"</strong> is currently undergoing review by platform administrators.
            Once approved, you will be able to post products, manage inventory, and receive orders.
          </p>
        </div>
      )}

      {/* Rejected Notice */}
      {isRejected && (
        <div className="notice-card error-notice">
          <h3>❌ Vendor Account Status: Rejected</h3>
          <p>
            Your vendor account has not been approved for public marketplace selling at this time. Please contact support.
          </p>
        </div>
      )}

      {/* Approved Vendor Dashboard Overview */}
      {!isPending && !isRejected && (
        <>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-title">Total Revenue</span>
              <span className="metric-value">{formatINR(analytics?.totalRevenue || 0)}</span>
            </div>

            <div className="metric-card">
              <span className="metric-title">Orders Received</span>
              <span className="metric-value">{analytics?.totalOrders || 0}</span>
            </div>

            <div className="metric-card">
              <span className="metric-title">Products Listed</span>
              <span className="metric-value">{analytics?.totalProducts || 0}</span>
            </div>

            <div className="metric-card">
              <span className="metric-title">Low Stock Alerts</span>
              <span className={`metric-value ${analytics?.lowStockCount > 0 ? 'text-warning' : ''}`}>
                {analytics?.lowStockCount || 0}
              </span>
            </div>
          </div>

          <div className="dashboard-quick-links">
            <Link to="/vendor/products" className="quick-link-card">
              <h3>📦 Manage Products</h3>
              <p>Add, edit, or remove catalog product listings.</p>
            </Link>

            <Link to="/vendor/inventory" className="quick-link-card">
              <h3>📊 Smart Inventory</h3>
              <p>Monitor stock levels and auto-calculated stockout predictions.</p>
            </Link>

            <Link to="/vendor/orders" className="quick-link-card">
              <h3>🚚 Customer Orders</h3>
              <p>Process pending sales and update shipment statuses.</p>
            </Link>

            <Link to="/vendor/insights" className="quick-link-card">
              <h3>✨ AI Business Insights</h3>
              <p>Generate smart recommendations for pricing and restocking.</p>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
