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
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return

    try {
      await apiRequest(`/products/${id}`, 'DELETE')
      setProducts(products.filter(p => p._id !== id))
    } catch (err) {
      alert(err.message || 'Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading catalog products...</p>
      </div>
    )
  }

  return (
    <div className="vendor-products-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">My Listed Products</h1>
          <p className="page-subtitle">Manage products visible in the VendiSphere marketplace.</p>
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
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
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
                      <strong>{p.name}</strong>
                    </div>
                  </td>
                  <td>{p.category}</td>
                  <td>{formatINR(p.price)}</td>
                  <td>
                    <span className={`stock-badge ${p.stock <= 5 ? 'stock-low' : 'stock-ok'}`}>
                      {p.stock} units
                    </span>
                  </td>
                  <td>⭐ {p.rating || 'N/A'}</td>
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
        <div className="empty-results">
          <h2>No products listed yet</h2>
          <p>Add your first product to start selling on VendiSphere.</p>
          <Link to="/vendor/products/new" className="btn-primary">
            Create Product Listing
          </Link>
        </div>
      )}
    </div>
  )
}
