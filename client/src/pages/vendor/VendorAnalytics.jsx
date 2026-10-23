import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'
import { formatINR } from '../../utils/formatINR'

export default function VendorAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/vendor/analytics')
      .then(data => setAnalytics(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="analytics-container animate-fade-up">
        <h1 className="page-title">Vendor Sales & Performance</h1>
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
    <div className="analytics-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">STORE REVENUE &amp; VELOCITY</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>Vendor Sales &amp; Performance</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Comprehensive performance breakdown of earnings, customer volume, and top revenue drivers.
          </p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-title">Gross Revenue</span>
          <span className="metric-value">{formatINR(analytics?.totalRevenue || 0)}</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Excludes cancelled orders</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Orders Processed</span>
          <span className="metric-value">{analytics?.totalOrders || 0}</span>
          <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Active sales transactions</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Total Units Sold</span>
          <span className="metric-value">{analytics?.productsSold || 0}</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Physical products dispatched</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Catalog Size</span>
          <span className="metric-value">{analytics?.totalProducts || 0}</span>
          <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Active listings</span>
        </div>
      </div>

      <div className="dashboard-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem' }}>🔥</span>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Top Performing Products</h2>
        </div>

        {analytics?.topProducts?.length > 0 ? (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Units Sold</th>
                  <th>Total Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.map(p => (
                  <tr key={p._id}>
                    <td><strong style={{ color: '#0f172a' }}>{p.name}</strong></td>
                    <td>
                      <span className="product-category-tag">{p.category}</span>
                    </td>
                    <td>{formatINR(p.price)}</td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#4f46e5' }}>{p.unitsSold} units</span>
                    </td>
                    <td><strong style={{ color: '#0f172a' }}>{formatINR(p.revenue)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            Sales performance data will populate here as customers checkout products from your catalog.
          </div>
        )}
      </div>
    </div>
  )
}
