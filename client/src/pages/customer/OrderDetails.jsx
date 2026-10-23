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
      <div className="order-details-container animate-fade-up">
        <h1 className="page-title">Order Status & Tracking</h1>
        <div className="skeleton-card" style={{ height: '140px', marginTop: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="empty-results" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
          ✕
        </div>
        <h2>Order Not Found</h2>
        <p>{error || 'The requested order details could not be retrieved.'}</p>
        <Link to="/orders" className="btn-primary">Back to Orders</Link>
      </div>
    )
  }

  const statuses = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered']
  const isCancelled = order.status === 'Cancelled'
  const currentStatusIndex = statuses.indexOf(order.status)

  return (
    <div className="order-details-container animate-fade-up">
      {/* Header */}
      <div className="order-details-header">
        <div>
          <span className="order-subtitle">ORDER RECEIPT &amp; TRACKING</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>
            Order #{order._id.substring(order._id.length - 8).toUpperCase()}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
            Purchased on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>

        <Link to="/orders" className="btn-secondary">
          ← Back to All Orders
        </Link>
      </div>

      {/* Status Progress Timeline */}
      <div className="status-timeline-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ margin: 0 }}>Fulfillment & Tracking Timeline</h3>
          <span className={`status-badge status-${order.status.toLowerCase()}`}>
            Current Status: {order.status}
          </span>
        </div>

        {isCancelled ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '12px', color: '#991b1b', fontSize: '0.92rem' }}>
            ❌ <strong>This order was cancelled.</strong> The allocated inventory has been returned to vendor stock.
          </div>
        ) : (
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
        )}
      </div>

      <div className="order-details-grid">
        {/* Purchased Items List */}
        <div className="order-items-card">
          <h2>Items in this Order ({order.items.length})</h2>
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
                    Vendor Store: <strong>{item.vendor?.name || 'Verified Vendor'}</strong>
                  </span>
                </div>

                <div className="table-item-pricing">
                  <span style={{ color: '#64748b' }}>{item.quantity} × {formatINR(item.price)}</span>
                  <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{formatINR(item.quantity * item.price)}</strong>
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
          <h2>Delivery & Payment</h2>

          <div className="receipt-section">
            <span className="receipt-label">Shipping Destination</span>
            <address className="receipt-address">
              <strong>{order.shippingAddress?.fullName}</strong><br />
              {order.shippingAddress?.address}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}<br />
              <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Contact: {order.shippingAddress?.phone}</span>
            </address>
          </div>

          <div className="summary-divider"></div>

          <div className="receipt-summary-rows">
            <div className="summary-row">
              <span style={{ color: '#64748b' }}>Items Subtotal</span>
              <span>{formatINR(order.totalAmount)}</span>
            </div>

            <div className="summary-row">
              <span style={{ color: '#64748b' }}>Standard Delivery</span>
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
