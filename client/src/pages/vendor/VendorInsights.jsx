import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'

export default function VendorInsights() {
  const [insightsData, setInsightsData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchInsights = async () => {
    setLoading(true)
    try {
      const data = await apiRequest('/ai/vendor-insights', 'POST')
      setInsightsData(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInsights()
  }, [])

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Running VendiSphere AI performance audit...</p>
      </div>
    )
  }

  return (
    <div className="ai-insights-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">✨ AI Business Insights & Recommendations</h1>
          <p className="page-subtitle">Automated intelligence analyzing store performance, inventory levels, and growth tips.</p>
        </div>

        <button className="btn-primary" onClick={fetchInsights}>
          🔄 Refresh AI Analysis
        </button>
      </div>

      <div className="ai-insights-card">
        <div className="ai-card-badge">VENDISPHERE AI INSIGHT ENGINE</div>
        <h2>{insightsData?.summary || 'Store Analysis Overview'}</h2>
        <p className="ai-timestamp">Last generated: {new Date(insightsData?.generatedAt || Date.now()).toLocaleString()}</p>

        <div className="insights-list">
          {insightsData?.insights?.map((item, idx) => (
            <div key={idx} className="insight-item-box">
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
