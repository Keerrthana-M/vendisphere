import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'
import { formatINR } from '../../utils/formatINR'

export default function VendorOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const data = await apiRequest('/vendor/orders')
      setOrders(data)
    } catch (err) {
      setError(err.message || 'Failed to load vendor orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId)
    try {
      await apiRequest(`/orders/${orderId}/status`, 'PUT', { status: newStatus })
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o))
    } catch (err) {
      alert(err.message || 'Failed to update order status')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="vendor-orders-container animate-fade-up">
        <h1 className="page-title">Vendor Orders Management</h1>
        <div className="skeleton-card" style={{ height: '300px', marginTop: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    )
  }

  const validStatuses = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

  return (
    <div className="vendor-orders-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">FULFILLMENT &amp; LOGISTICS</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>Vendor Orders Management</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Process customer orders for your products and update delivery fulfillment stages.
          </p>
        </div>

        {orders.length > 0 && (
          <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
            <strong>{orders.length}</strong> total order{orders.length === 1 ? '' : 's'} received
          </span>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {orders.length > 0 ? (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order Ref</th>
                <th>Customer</th>
                <th>Purchased Items</th>
                <th>Shipping Destination</th>
                <th>Order Date</th>
                <th>Current Status</th>
                <th>Update Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td>
                    <strong style={{ color: '#0f172a' }}>
                      #{order._id.substring(order._id.length - 8).toUpperCase()}
                    </strong>
                  </td>
                  <td>
                    <div><strong style={{ color: '#0f172a' }}>{order.user?.name || 'Customer'}</strong></div>
                    <small style={{ color: '#64748b' }}>{order.user?.email}</small>
                  </td>
                  <td>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-mini-line">
                        • <strong>{item.product?.name}</strong> (Qty: {item.quantity})
                      </div>
                    ))}
                  </td>
                  <td>
                    <small style={{ color: '#334155', lineHeight: 1.5, display: 'block' }}>
                      <strong>{order.shippingAddress?.fullName}</strong><br />
                      {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}
                    </small>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updatingId === order._id}
                      className="form-input-sm"
                      style={{ borderRadius: '8px', fontWeight: 600, background: '#ffffff' }}
                    >
                      {validStatuses.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-results" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
            🚚
          </div>
          <h2>No orders received yet</h2>
          <p>Orders containing your listed products will appear here immediately after customer checkout.</p>
        </div>
      )}
    </div>
  )
}
