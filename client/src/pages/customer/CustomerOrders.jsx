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
      <div className="orders-page-container animate-fade-up">
        <h1 className="page-title">My Orders</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1.5rem' }}>
          {[1, 2].map(n => (
            <div key={n} className="skeleton-card" style={{ height: '140px', padding: '1.5rem' }}>
              <div className="skeleton-shimmer skeleton-title" style={{ width: '30%', marginBottom: '1rem' }}></div>
              <div className="skeleton-shimmer skeleton-text" style={{ width: '60%' }}></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="orders-page-container animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>My Orders</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Track delivery progress and review purchases from marketplace vendors.
          </p>
        </div>
        {orders.length > 0 && (
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Total <strong>{orders.length}</strong> order{orders.length === 1 ? '' : 's'} placed
          </span>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {orders.length > 0 ? (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' }}>
              <div className="order-card-header">
                <div>
                  <span className="order-id-label">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</span>
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
                          Qty: <strong>{item.quantity}</strong> × {formatINR(item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-card-footer">
                  <span className="order-total-price">
                    Total Amount: <strong style={{ color: '#0f172a', fontSize: '1.15rem' }}>{formatINR(order.totalAmount)}</strong>
                  </span>

                  <Link to={`/orders/${order._id}`} className="btn-secondary btn-sm" style={{ fontWeight: 600 }}>
                    Track Order & Receipt →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-results" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
            📦
          </div>
          <h2>No orders placed yet</h2>
          <p>When you purchase items from independent vendors, your orders and tracking timelines will appear here.</p>
          <Link to="/marketplace" className="btn-primary btn-lg">
            Start Exploring Marketplace →
          </Link>
        </div>
      )}
    </div>
  )
}
