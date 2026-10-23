import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { formatINR } from '../../utils/formatINR'

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrderDetails = async () => {
    setLoading(true)
    try {
      const data = await apiRequest(`/orders/${id}`)
      setOrder(data)
    } catch (err) {
      setError(err.message || 'Order not found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="empty-results">
        <h2>Order Not Found</h2>
        <p>{error}</p>
        <Link to="/orders" className="btn-primary">Back to Orders</Link>
      </div>
    )
  }

  const statuses = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered']
  const currentStatusIndex = statuses.indexOf(order.status)

  return (
    <div className="order-details-container animate-fade-up">
      <div className="order-details-header">
        <div>
          <span className="order-subtitle">ORDER #{order._id}</span>
          <h1 className="page-title">Order Status & Receipt</h1>
        </div>

        <Link to="/orders" className="btn-secondary">
          ← Back to All Orders
        </Link>
      </div>

      {/* Status Progress Timeline */}
      <div className="status-timeline-card">
        <h3>Order Tracking Timeline</h3>
        <div className="timeline-steps">
          {statuses.map((st, idx) => {
            const isCompleted = idx <= currentStatusIndex
            const isCurrent = st === order.status

            return (
              <div key={st} className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="step-circle">{isCompleted ? '✓' : idx + 1}</div>
                <span className="step-label">{st}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="order-details-grid">
        {/* Purchased Items List */}
        <div className="order-items-card">
          <h2>Items Purchased</h2>
          <div className="order-items-table">
            {order.items.map((item, idx) => (
              <div key={idx} className="order-table-row">
                <img 
                  src={item.product?.imageUrl} 
                  alt={item.product?.name}
                  className="table-item-img"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=Item' }}
                />

                <div className="table-item-meta">
                  <Link to={`/product/${item.product?._id}`} className="table-item-title">
                    {item.product?.name}
                  </Link>
                  <span className="table-item-vendor">
                    Seller: {item.vendor?.name || 'VendiSphere Vendor'}
                  </span>
                </div>

                <div className="table-item-pricing">
                  <span>{item.quantity} × {formatINR(item.price)}</span>
                  <strong>{formatINR(item.quantity * item.price)}</strong>
                </div>

                <div className="review-action-col">
                  <Link to={`/product/${item.product?._id}`} className="btn-secondary btn-sm">
                    Write Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Payment Receipt */}
        <div className="order-receipt-card">
          <h2>Shipping & Summary</h2>

          <div className="receipt-section">
            <span className="receipt-label">Shipping Address:</span>
            <address className="receipt-address">
              <strong>{order.shippingAddress?.fullName}</strong><br />
              {order.shippingAddress?.address}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
              Phone: {order.shippingAddress?.phone}
            </address>
          </div>

          <div className="summary-divider"></div>

          <div className="receipt-summary-rows">
            <div className="summary-row">
              <span>Items Total</span>
              <span>{formatINR(order.totalAmount)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping & Handling</span>
              <span className="free-badge">FREE</span>
            </div>

            <div className="summary-row total-row">
              <span>Total Paid</span>
              <span>{formatINR(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
