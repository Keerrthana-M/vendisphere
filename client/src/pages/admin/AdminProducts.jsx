import { useState, useEffect } from 'react'
import { apiRequest } from '../../services/api'
import { formatINR } from '../../utils/formatINR'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiRequest('/admin/products')
      .then(data => setProducts(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading marketplace catalog...</p>
      </div>
    )
  }

  return (
    <div className="admin-products-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Marketplace Product Catalog</h1>
          <p className="page-subtitle">Oversight of all products uploaded across multi-vendor stores.</p>
        </div>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Vendor</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id}>
                <td className="product-table-cell">
                  <img 
                    src={p.imageUrl} 
                    alt={p.name} 
                    className="table-thumb"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=Product' }}
                  />
                  <div><strong>{p.name}</strong></div>
                </td>
                <td>{p.vendor?.name || 'Verified Vendor'}</td>
                <td>{p.category}</td>
                <td>{formatINR(p.price)}</td>
                <td>{p.stock} units</td>
                <td>⭐ {p.rating || 'New'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
