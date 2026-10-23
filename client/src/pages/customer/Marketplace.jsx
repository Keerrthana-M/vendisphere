import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatINR'

export default function Marketplace() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  // AI Shopping Assistant state
  const [aiOpen, setAiOpen] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [cartMsg, setCartMsg] = useState('')

  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const categories = ['All', 'Electronics', 'Fashion', 'Grocery', 'Accessories', 'Home & Kitchen', 'Books']

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let queryParams = []
      if (searchTerm) queryParams.push(`search=${encodeURIComponent(searchTerm)}`)
      if (selectedCategory !== 'All') queryParams.push(`category=${encodeURIComponent(selectedCategory)}`)
      
      const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : ''
      const data = await apiRequest(`/products${queryString}`)
      setProducts(data)
    } catch (err) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts()
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, selectedCategory])

  const handleAddToCart = async (productId) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user?.role !== 'customer') {
      alert('Only customer accounts can add items to cart.')
      return
    }

    try {
      await apiRequest('/cart', 'POST', { productId, quantity: 1 })
      setCartMsg('Item added to cart!')
      setTimeout(() => setCartMsg(''), 3000)
    } catch (err) {
      alert(err.message || 'Failed to add item to cart')
    }
  }

  const handleAiAsk = async (e) => {
    e.preventDefault()
    if (!aiQuery.trim()) return
    setAiLoading(true)
    try {
      const data = await apiRequest('/ai/shopping-assistant', 'POST', { query: aiQuery })
      setAiResponse(data)
    } catch (err) {
      setAiResponse({ reply: 'Shopping assistant is currently updating. Try searching in the marketplace!' })
    } finally {
      setAiLoading(false)
    }
  }

  return (
    <div className="marketplace-container animate-fade-up">
      {/* Header */}
      <div className="marketplace-header-row">
        <div>
          <h1 className="marketplace-title">Explore Marketplace</h1>
          <p className="marketplace-subtitle">
            Discover real products from verified multi-vendor storefronts.
          </p>
        </div>

        <button 
          className="btn-secondary ai-assistant-trigger"
          onClick={() => setAiOpen(!aiOpen)}
        >
          ✨ AI Shopping Assistant
        </button>
      </div>

      {cartMsg && <div className="toast-success">{cartMsg}</div>}

      {/* AI Assistant Overlay Drawer */}
      {aiOpen && (
        <div className="ai-assistant-card animate-fade-up">
          <div className="ai-card-header">
            <h3>✨ VendiSphere AI Assistant</h3>
            <button className="close-btn" onClick={() => setAiOpen(false)}>✕</button>
          </div>
          <p className="ai-card-desc">Ask questions about products, recommendations, or gift ideas across our catalog.</p>
          
          <form onSubmit={handleAiAsk} className="ai-form">
            <input 
              type="text"
              placeholder="e.g. Find noise cancelling headphones under ₹15,000"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="btn-primary" disabled={aiLoading}>
              {aiLoading ? 'Asking...' : 'Ask AI'}
            </button>
          </form>

          {aiResponse && (
            <div className="ai-response-box">
              <p className="ai-reply">{aiResponse.reply}</p>
              {aiResponse.recommendations && aiResponse.recommendations.length > 0 && (
                <div className="ai-recs">
                  <strong>Suggested Products:</strong>
                  <ul>
                    {aiResponse.recommendations.map(r => (
                      <li key={r._id || r.name}>
                        <Link to={`/product/${r._id}`}>{r.name} — {formatINR(r.price)}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Controls: Search Bar & Category Filter Chips */}
      <div className="marketplace-controls">
        <div className="search-box">
          <svg className="search-box-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search products by name, keyword, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
              ✕
            </button>
          )}
        </div>

        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Loading marketplace catalog...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id} className="marketplace-product-card">
              <Link to={`/product/${product._id}`} className="product-image-link">
                <img 
                  src={product.imageUrl} 
                  alt={product.name} 
                  className="product-card-img" 
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Product+Image' }}
                />
              </Link>

              <div className="product-card-content">
                <div className="product-card-top">
                  <span className="product-category-tag">{product.category}</span>
                  <span className="product-price">{formatINR(product.price)}</span>
                </div>

                <Link to={`/product/${product._id}`} className="product-name-link">
                  <h3 className="product-name">{product.name}</h3>
                </Link>

                <p className="product-description">
                  {product.description.length > 80 
                    ? `${product.description.substring(0, 80)}...` 
                    : product.description}
                </p>

                <div className="product-card-footer">
                  <span className="product-vendor-info">
                    Store: <strong>{product.vendor?.name || 'Verified Vendor'}</strong>
                  </span>
                  
                  <button 
                    className="btn-primary product-action-btn"
                    onClick={() => handleAddToCart(product._id)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-results">
          <p>No products found matching your filter criteria.</p>
          <button
            className="btn-secondary"
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('All')
            }}
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}
