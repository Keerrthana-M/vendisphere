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
      <div className="admin-products-container animate-fade-up">
        <h1 className="page-title">Marketplace Product Catalog</h1>
        <div className="skeleton-card" style={{ height: '320px', marginTop: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-products-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">GLOBAL INVENTORY OVERSIGHT</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>Marketplace Product Catalog</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Auditing all products published across independent vendor storefronts.
          </p>
        </div>

        <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
          Total <strong>{products.length}</strong> product{products.length === 1 ? '' : 's'} listed
        </span>
      </div>

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Product Details</th>
              <th>Origin Store</th>
              <th>Category</th>
              <th>Price</th>
              <th>Current Stock</th>
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
                  <div>
                    <strong style={{ color: '#0f172a' }}>{p.name}</strong>
                    <span style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8' }}>
                      ID: #{p._id.substring(p._id.length - 6).toUpperCase()}
                    </span>
                  </div>
                </td>
                <td>
                  <strong style={{ color: '#334155' }}>{p.vendor?.name || 'Verified Vendor'}</strong>
                </td>
                <td>
                  <span className="product-category-tag">{p.category}</span>
                </td>
                <td>
                  <strong style={{ color: '#0f172a' }}>{formatINR(p.price)}</strong>
                </td>
                <td>
                  <span className={`stock-badge ${p.stock <= 5 ? 'stock-low' : 'stock-ok'}`}>
                    {p.stock <= 5 ? `⚠️ Only ${p.stock}` : `${p.stock} units`}
                  </span>
                </td>
                <td>
                  <span style={{ fontWeight: 600 }}>⭐ {p.rating > 0 ? p.rating : 'New'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
