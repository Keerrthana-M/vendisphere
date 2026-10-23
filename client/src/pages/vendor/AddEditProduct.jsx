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
        alert('Product updated successfully!')
      } else {
        await apiRequest('/products', 'POST', formData)
        alert('Product created successfully!')
      }
      navigate('/vendor/products')
    } catch (err) {
      setError(err.message || 'Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    )
  }

  return (
    <div className="form-page-container animate-fade-up">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">{isEditMode ? 'Edit Product' : 'Add New Product'}</h1>
          <p className="page-subtitle">
            {isEditMode ? 'Update product information and stock.' : 'Create a new marketplace product listing.'}
          </p>
        </div>

        <Link to="/vendor/products" className="btn-secondary">
          ← Back to Products
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="auth-card form-card-wide">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input 
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Acoustic Pro Wireless Headphones"
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
              <label className="form-label">Price (₹) *</label>
              <input 
                type="number"
                step="0.01"
                min="0"
                name="price"
                className="form-input"
                placeholder="99.99"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label">Initial Stock Quantity *</label>
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
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Description *</label>
            <textarea 
              name="description"
              rows="4"
              className="form-input"
              placeholder="Detailed description of features, materials, and warranty..."
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
              {submitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
