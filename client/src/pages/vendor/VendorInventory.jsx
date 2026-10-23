import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'
import { formatINR } from '../../utils/formatINR'

export default function VendorInventory() {
  const [inventory, setInventory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchInventory = async () => {
    setLoading(true)
    try {
      const data = await apiRequest('/vendor/inventory')
      setInventory(data)
    } catch (err) {
      setError(err.message || 'Failed to load inventory intelligence')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  if (loading) {
    return (
      <div className="vendor-inventory-container animate-fade-up">
        <h1 className="page-title">Smart Inventory Intelligence</h1>
        <div className="skeleton-card" style={{ height: '320px', marginTop: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    )
  }

  const lowStockCount = inventory.filter(i => i.isLowStock || i.stock === 0).length

  return (
    <div className="vendor-inventory-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">VELOCITY &amp; REORDER ANALYTICS</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>Smart Inventory Intelligence</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Automated stock monitoring with 14-day velocity forecasting and intelligent replenishment prompts.
          </p>
        </div>

        {lowStockCount > 0 && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '8px 14px', borderRadius: '12px', fontSize: '0.88rem', color: '#b45309', fontWeight: 600 }}>
            ⚠️ {lowStockCount} product{lowStockCount === 1 ? '' : 's'} require immediate restock
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {inventory.length > 0 ? (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Current Stock</th>
                <th>Total Sold</th>
                <th>Daily Velocity</th>
                <th>Stockout Forecast</th>
                <th>Suggested Reorder</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item._id}>
                  <td><strong style={{ color: '#0f172a' }}>{item.name}</strong></td>
                  <td>
                    <span className="product-category-tag">{item.category}</span>
                  </td>
                  <td>{formatINR(item.price)}</td>
                  <td>
                    <strong className={item.isLowStock ? 'text-warning' : ''} style={{ fontSize: '0.95rem' }}>
                      {item.stock} units
                    </strong>
                  </td>
                  <td>{item.totalSold} units</td>
                  <td>
                    <span style={{ color: '#4f46e5', fontWeight: 600 }}>
                      {item.avgDailySales} / day
                    </span>
                  </td>
                  <td>
                    <span className="intelligence-pill">
                      💡 {item.intelligenceNotice}
                    </span>
                  </td>
                  <td>
                    <strong className={item.suggestedReorder > 0 ? 'text-highlight' : ''} style={{ fontSize: '0.95rem' }}>
                      {item.suggestedReorder > 0 ? `+${item.suggestedReorder} units` : 'Adequate'}
                    </strong>
                  </td>
                  <td>
                    <span className={`status-badge ${item.status === 'Out of Stock' ? 'status-cancelled' : item.isLowStock ? 'status-lowstock' : 'status-instock'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="table-caption-note" style={{ padding: '0.75rem 1.25rem', margin: 0, borderTop: '1px solid #f1f5f9' }}>
            * <em>Suggested reorder quantity calculated using a 14-day sales velocity projection plus a 5-unit safety stock buffer: Target = (Avg Daily Sales × 14) + 5 - Current Stock.</em>
          </p>
        </div>
      ) : (
        <div className="empty-results" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
            📊
          </div>
          <h2>No inventory data available</h2>
          <p>Add products to your catalog to activate real-time velocity calculations and stockout predictions.</p>
        </div>
      )}
    </div>
  )
}
