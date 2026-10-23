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
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading platform performance metrics...</p>
      </div>
    )
  }

  return (
    <div className="admin-analytics-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Platform Performance Analytics</h1>
          <p className="page-subtitle">Aggregated performance and ecosystem growth indicators.</p>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-title">Gross Platform Revenue</span>
          <span className="metric-value">{formatINR(analytics?.totalPlatformRevenue || 0)}</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Total Transactions</span>
          <span className="metric-value">{analytics?.totalOrders || 0}</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Active Vendor Stores</span>
          <span className="metric-value">{analytics?.approvedVendors || 0}</span>
        </div>

        <div className="metric-card">
          <span className="metric-title">Marketplace Product Count</span>
          <span className="metric-value">{analytics?.totalProducts || 0}</span>
        </div>
      </div>
    </div>
  )
}
