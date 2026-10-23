import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { formatINR } from '../../utils/formatINR'

export default function CustomerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await apiRequest('/orders')
      setOrders(data)
    } catch (err) {
      setError(err.message || 'Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading your order history...</p>
      </div>
    )
  }

  return (
    <div className="orders-page-container animate-fade-up">
      <h1 className="page-title">My Orders</h1>
      <p className="page-subtitle">Track your marketplace purchases and order status.</p>

      {error && <div className="error-message">{error}</div>}

      {orders.length > 0 ? (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <div>
                  <span className="order-id-label">Order #{order._id.substring(order._id.length - 8)}</span>
                  <span className="order-date-label">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="order-status-badge-wrap">
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-items-preview">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="order-item-mini">
                      <img 
                        src={item.product?.imageUrl} 
                        alt={item.product?.name}
                        className="order-item-thumb"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/60?text=Item' }}
                      />
                      <div className="order-item-desc">
                        <span className="order-item-name">{item.product?.name}</span>
                        <span className="order-item-meta">
                        Qty: {item.quantity} × {formatINR(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <span className="order-total-price">
                  Total: <strong>{formatINR(order.totalAmount)}</strong>
                  </span>

                  <Link to={`/orders/${order._id}`} className="btn-secondary btn-sm">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-results">
          <h2>No orders placed yet</h2>
          <p>When you buy items from VendiSphere vendors, your orders will appear here.</p>
          <Link to="/marketplace" className="btn-primary">
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  )
}
