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
      <div className="ai-insights-container animate-fade-up">
        <h1 className="page-title">✨ AI Business Insights</h1>
        <div className="skeleton-card" style={{ height: '320px', marginTop: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-insights-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">STORE INTELLIGENCE ENGINE</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>AI Business Insights &amp; Recommendations</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Machine intelligence evaluating sales velocity, inventory risks, and catalog growth opportunities.
          </p>
        </div>

        <button className="btn-primary" onClick={fetchInsights}>
          🔄 Refresh AI Analysis
        </button>
      </div>

      <div className="ai-insights-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="ai-card-badge">VENDISPHERE AI ADVISOR</div>
          <span className="ai-timestamp">Audit Generated: {new Date(insightsData?.generatedAt || Date.now()).toLocaleString()}</span>
        </div>

        <h2 style={{ margin: '0.5rem 0', fontSize: '1.45rem', fontWeight: 800, color: '#0f172a' }}>
          {insightsData?.summary || 'Store Performance Audit'}
        </h2>

        <div className="insights-list">
          {insightsData?.insights?.map((item, idx) => (
            <div key={idx} className="insight-item-box">
              <p style={{ margin: 0 }}>{item}</p>
            </div>
          ))}
        </div>

        {insightsData?.recommendations && insightsData.recommendations.length > 0 && (
          <div className="insights-recommendations-section">
            <h3 className="rec-title">🎯 Actionable Growth Recommendations</h3>
            <ul className="rec-list">
              {insightsData.recommendations.map((rec, idx) => (
                <li key={idx} className="rec-item">
                  <span className="rec-bullet">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {insightsData?.disclaimer && (
          <div className="ai-disclaimer-note">
            ℹ️ <em>{insightsData.disclaimer}</em>
          </div>
        )}
      </div>
    </div>
  )
}
