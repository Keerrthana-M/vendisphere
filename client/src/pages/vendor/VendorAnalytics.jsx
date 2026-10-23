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
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading revenue & sales analytics...</p>
      </div>
    )
  }

  return (
    <div className="analytics-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Vendor Sales & Performance</h1>
          <p className="page-subtitle">Detailed business breakdown of earnings, volume, and top performers.</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-title">Total Revenue</span>
          <span className="metric-value">{formatINR(analytics?.totalRevenue || 0)}</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Orders Processed</span>
          <span className="metric-value">{analytics?.totalOrders || 0}</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Units Sold</span>
          <span className="metric-value">{analytics?.productsSold || 0}</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Catalog Size</span>
          <span className="metric-value">{analytics?.totalProducts || 0}</span>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>🔥 Top Performing Products</h2>
        {analytics?.topProducts?.length > 0 ? (
          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Units Sold</th>
                  <th>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topProducts.map(p => (
                  <tr key={p._id}>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.category}</td>
                    <td>{formatINR(p.price)}</td>
                    <td>{p.unitsSold} units</td>
                    <td><strong>{formatINR(p.revenue)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-reviews-msg">Sales data will populate here as products are ordered.</p>
        )}
      </div>
    </div>
  )
}
