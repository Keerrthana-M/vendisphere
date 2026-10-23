import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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
      <div className="admin-orders-container animate-fade-up">
        <h1 className="page-title">Platform Order Transactions</h1>
        <div className="skeleton-card" style={{ height: '320px', marginTop: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-orders-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">TRANSACTION AUDIT</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>Platform Order Transactions</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Master audit trail of customer purchase transactions across all marketplace vendors.
          </p>
        </div>

        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Total <strong>{orders.length}</strong> transaction{orders.length === 1 ? '' : 's'} recorded
        </span>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Purchased Items</th>
              <th>Gross Amount</th>
              <th>Transaction Date</th>
              <th>Fulfillment Status</th>
              <th>Receipt</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id}>
                <td>
                  <strong style={{ color: '#0f172a' }}>
                    #{o._id.substring(o._id.length - 8).toUpperCase()}
                  </strong>
                </td>
                <td>
                  <strong style={{ color: '#0f172a' }}>{o.user?.name || 'Customer'}</strong>
                  <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
                    {o.user?.email}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>{o.items?.length || 0} item(s)</span>
                </td>
                <td>
                  <strong style={{ color: '#0f172a' }}>{formatINR(o.totalAmount)}</strong>
                </td>
                <td>
                  <span style={{ fontSize: '0.86rem', color: '#64748b' }}>
                    {new Date(o.createdAt).toLocaleDateString()}
                  </span>
                </td>
                <td>
                  <span className={`status-badge status-${o.status?.toLowerCase()}`}>
                    {o.status}
                  </span>
                </td>
                <td>
                  <Link to={`/orders/${o._id}`} className="btn-secondary btn-sm" style={{ fontWeight: 600 }}>
                    View Receipt
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
