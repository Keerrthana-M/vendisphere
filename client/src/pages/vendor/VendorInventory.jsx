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
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Analyzing stock & daily sales velocity...</p>
      </div>
    )
  }

  return (
    <div className="vendor-inventory-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Smart Inventory Intelligence</h1>
          <p className="page-subtitle">Real-time stock tracking with automated sales velocity & stockout predictions.</p>
        </div>
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
                <th>Avg. Daily Sales</th>
                <th>Smart Stockout Prediction</th>
                <th>Suggested Reorder</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map(item => (
                <tr key={item._id}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.category}</td>
                  <td>{formatINR(item.price)}</td>
                  <td>
                    <strong className={item.isLowStock ? 'text-warning' : ''}>
                      {item.stock} units
                    </strong>
                  </td>
                  <td>{item.totalSold} units</td>
                  <td>{item.avgDailySales} / day</td>
                  <td>
                    <span className="intelligence-pill">
                      💡 {item.intelligenceNotice}
                    </span>
                  </td>
                  <td>
                    <strong className={item.suggestedReorder > 0 ? 'text-highlight' : ''}>
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
          <p className="table-caption-note">
            * <em>Suggested reorder quantity calculated using a 14-day sales velocity projection plus a 5-unit safety stock buffer: Target = (Avg Daily Sales × 14) + 5 - Current Stock.</em>
          </p>
        </div>
      ) : (
        <div className="empty-results">
          <h2>No inventory data available</h2>
          <p>Add products to your catalog to start tracking smart inventory analytics.</p>
        </div>
      )}
    </div>
  )
}
