import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'

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
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading customer orders...</p>
      </div>
    )
  }

  const validStatuses = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

  return (
    <div className="vendor-orders-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Vendor Orders Management</h1>
          <p className="page-subtitle">Track orders for your products and update fulfillment status.</p>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {orders.length > 0 ? (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Purchased Items</th>
                <th>Shipping Address</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Update Fulfillment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order._id}>
                  <td><strong>#{order._id.substring(order._id.length - 8)}</strong></td>
                  <td>
                    <div><strong>{order.user?.name}</strong></div>
                    <small>{order.user?.email}</small>
                  </td>
                  <td>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-mini-line">
                        • {item.product?.name} (Qty: {item.quantity})
                      </div>
                    ))}
                  </td>
                  <td>
                    <small>
                      {order.shippingAddress?.fullName}, {order.shippingAddress?.address}, {order.shippingAddress?.city}
                    </small>
                  </td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
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
        <div className="empty-results">
          <h2>No orders received yet</h2>
          <p>Orders containing your products will be displayed here as customers checkout.</p>
        </div>
      )}
    </div>
  )
}
