import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { formatINR } from '../../utils/formatINR'

export default function VendorProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const data = await apiRequest('/vendor/products')
      setProducts(data)
    } catch (err) {
      setError(err.message || 'Failed to load vendor products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from your catalog?`)) return

    try {
      await apiRequest(`/products/${id}`, 'DELETE')
      setProducts(products.filter(p => p._id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="vendor-products-container animate-fade-up">
        <h1 className="page-title">My Listed Products</h1>
        <div className="skeleton-card" style={{ height: '300px', marginTop: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="vendor-products-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">STOREFRONT CATALOG</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>My Listed Products</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Manage active product listings visible to customers in the VendiSphere marketplace.
          </p>
        </div>

        <Link to="/vendor/products/new" className="btn-primary">
          + Add New Product
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {products.length > 0 ? (
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Product Details</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock Level</th>
                <th>Rating</th>
                <th>Actions</th>
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
                      <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>
                        ID: #{p._id.substring(p._id.length - 6).toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="product-category-tag">{p.category}</span>
                  </td>
                  <td>
                    <strong style={{ color: '#0f172a' }}>{formatINR(p.price)}</strong>
                  </td>
                  <td>
                    <span className={`stock-badge ${p.stock <= 5 ? 'stock-low' : 'stock-ok'}`}>
                      {p.stock <= 5 ? `⚠️ Only ${p.stock} units` : `${p.stock} units`}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>⭐ {p.rating > 0 ? p.rating : 'New'}</span>
                  </td>
                  <td className="action-buttons-cell">
                    <Link to={`/vendor/products/edit/${p._id}`} className="btn-secondary btn-sm">
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(p._id, p.name)}
                      className="btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-results" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
            📦
          </div>
          <h2>No products listed yet</h2>
          <p>Create your first product listing to make it discoverable in the VendiSphere marketplace.</p>
          <Link to="/vendor/products/new" className="btn-primary btn-lg">
            Create Product Listing →
          </Link>
        </div>
      )}
    </div>
  )
}
