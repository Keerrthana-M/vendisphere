import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiRequest } from '../../services/api'

export default function AddEditProduct() {
  const { id } = useParams()
  const isEditMode = !!id
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Electronics',
    price: '',
    imageUrl: '',
    stock: ''
  })

  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    'Electronics',
    'Fashion',
    'Grocery',
    'Accessories',
    'Home & Kitchen',
    'Books',
    'Sports & Fitness',
    'Beauty & Personal Care'
  ]

  useEffect(() => {
    if (isEditMode) {
      apiRequest(`/products/${id}`)
        .then(data => {
          setFormData({
            name: data.name,
            description: data.description,
            category: data.category,
            price: data.price,
            imageUrl: data.imageUrl,
            stock: data.stock
          })
        })
        .catch(err => setError(err.message || 'Failed to load product details'))
        .finally(() => setLoading(false))
    }
  }, [id, isEditMode])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      if (isEditMode) {
        await apiRequest(`/products/${id}`, 'PUT', formData)
        alert('✓ Product updated successfully!')
      } else {
        await apiRequest('/products', 'POST', formData)
        alert('✓ Product created successfully!')
      }
      navigate('/vendor/products')
    } catch (err) {
      setError(err.message || 'Failed to save product. Please check all fields.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="form-page-container animate-fade-up">
        <h1 className="page-title">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
        <div className="skeleton-card" style={{ height: '360px', marginTop: '1.5rem' }}>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="form-page-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <span className="section-subtitle">PRODUCT MANAGEMENT</span>
          <h1 className="page-title" style={{ margin: '4px 0 0 0' }}>
            {isEditMode ? 'Edit Product Listing' : 'Create New Product'}
          </h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            {isEditMode ? 'Update product information, pricing, or stock level.' : 'Add an item to be discoverable in the VendiSphere marketplace.'}
          </p>
        </div>

        <Link to="/vendor/products" className="btn-secondary">
          ← Back to Catalog
        </Link>
      </div>

      {error && (
        <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>{error}</span>
        </div>
      )}

      <div className="auth-card form-card-wide" style={{ background: '#ffffff', border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)' }}>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input 
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Acoustic Pro Wireless Noise-Cancelling Headphones"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-input"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Unit Price (₹) *</label>
              <input 
                type="number"
                step="0.01"
                min="0"
                name="price"
                className="form-input"
                placeholder="4999.00"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Available Stock Quantity *</label>
              <input 
                type="number"
                min="0"
                name="stock"
                className="form-input"
                placeholder="25"
                value={formData.stock}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL *</label>
              <input 
                type="url"
                name="imageUrl"
                className="form-input"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.imageUrl}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Live Image Preview */}
          {formData.imageUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 14px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <img 
                src={formData.imageUrl} 
                alt="Product preview" 
                style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px' }}
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>✓ Image Preview Active</span>
                <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b' }}>Make sure image is sharp and publicly accessible.</span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Product Description &amp; Features *</label>
            <textarea 
              name="description"
              rows="4"
              className="form-input"
              placeholder="Highlight technical features, included accessories, dimensions, warranty, or battery life..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-actions-right">
            <Link to="/vendor/products" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving Product...' : isEditMode ? 'Update Product' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
