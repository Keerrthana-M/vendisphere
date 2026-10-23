import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'
import { formatINR } from '../../utils/formatINR'

export default function AdminAnalytics() {
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
      <div className="admin-analytics-container animate-fade-up">
        <h1 className="page-title">Platform Performance Analytics</h1>
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
    <div className="admin-analytics-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">AGGREGATED ECOSYSTEM METRICS</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>Platform Performance Analytics</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Consolidated growth indicators, transactional volumes, and multi-vendor scale metrics.
          </p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-title">Gross Platform GMV</span>
          <span className="metric-value">{formatINR(analytics?.totalPlatformRevenue || 0)}</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Excludes cancelled transactions</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Total Transactions</span>
          <span className="metric-value">{analytics?.totalOrders || 0}</span>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Completed customer checkouts</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Active Vendor Stores</span>
          <span className="metric-value">{analytics?.approvedVendors || 0}</span>
          <span style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 600 }}>Approved independent merchants</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Marketplace Product Count</span>
          <span className="metric-value">{analytics?.totalProducts || 0}</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Live catalog items</span>
        </div>
      </div>
    </div>
  )
}
