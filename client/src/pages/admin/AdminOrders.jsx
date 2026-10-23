import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'
import { formatINR } from '../../utils/formatINR'

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/admin/orders')
      .then(data => setOrders(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading all marketplace transactions...</p>
      </div>
    )
  }

  return (
    <div className="admin-orders-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Platform Order Transactions</h1>
          <p className="page-subtitle">Master list of orders across all platform customers and vendors.</p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items Count</th>
              <th>Total Amount</th>
              <th>Order Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id}>
                <td><strong>#{o._id.substring(o._id.length - 8)}</strong></td>
                <td>{o.user?.name || 'Customer'}</td>
                <td>{o.items?.length || 0} item(s)</td>
                <td><strong>{formatINR(o.totalAmount)}</strong></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${o.status?.toLowerCase()}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
