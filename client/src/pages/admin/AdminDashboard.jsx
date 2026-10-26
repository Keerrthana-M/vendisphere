import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { formatINR } from '../../utils/formatINR'
import { AreaTrendChart } from '../../components/common/Charts'

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
      <div className="admin-dashboard-container animate-fade-up">
        <h1 className="page-title">Platform Administration</h1>
        <div className="metrics-grid" style={{ marginTop: '1.5rem' }}>
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="skeleton-card" style={{ height: '110px' }}>
              <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">MASTER PLATFORM OVERSIGHT</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>Platform Administration</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Comprehensive management of customers, multi-vendor stores, catalog products, and transactions.
          </p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-title">Gross Marketplace GMV</span>
          <span className="metric-value">{formatINR(analytics?.totalPlatformRevenue || 0)}</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Excludes cancelled transactions</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Registered Shoppers</span>
          <span className="metric-value">{analytics?.totalCustomers || 0}</span>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Active customer accounts</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Approved Storefronts</span>
          <span className="metric-value">{analytics?.approvedVendors || 0}</span>
          <span style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 600 }}>Active marketplace sellers</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Pending Approvals</span>
          <span className={`metric-value ${analytics?.pendingVendors > 0 ? 'text-warning' : ''}`}>
            {analytics?.pendingVendors || 0}
          </span>
          <span style={{ fontSize: '0.78rem', color: analytics?.pendingVendors > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }}>
            {analytics?.pendingVendors > 0 ? 'Awaiting administrator review' : 'No pending applications'}
          </span>
        </div>
      </div>
      
      {/* Platform GMV Velocity Trend Chart */}
      <div style={{ marginTop: '2rem' }}>
        <AreaTrendChart 
          title="Platform Transaction Growth"
          subtitle="Consolidated 6-month transaction volume curve across India"
          height={230}
        />
      </div>

      <div className="dashboard-quick-links" style={{ marginTop: '2rem' }}>
        <Link to="/admin/vendors" className="quick-link-card">
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '4px' }}>
            🏪
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Vendor Approvals</h3>
            {analytics?.pendingVendors > 0 && (
              <span className="status-badge status-pending">{analytics.pendingVendors} Pending</span>
            )}
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Review merchant applications, examine store descriptions, and grant selling privileges.
          </p>
        </Link>

        <Link to="/admin/users" className="quick-link-card">
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '4px' }}>
            👥
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Platform Users</h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Audit all customer, vendor, and administrator credentials and registration timelines.
          </p>
        </Link>

        <Link to="/admin/products" className="quick-link-card">
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '4px' }}>
            📦
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Catalog Oversight</h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Monitor all products uploaded across independent vendor storefronts.
          </p>
        </Link>

        <Link to="/admin/orders" className="quick-link-card">
          <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: '4px' }}>
            🚚
          </div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Platform Orders</h3>
          <p style={{ margin: 0, fontSize: '0.88rem', color: '#64748b' }}>
            Track transactions across all customers and multi-vendor order fulfillments.
          </p>
        </Link>
      </div>
    </div>
  )
}
