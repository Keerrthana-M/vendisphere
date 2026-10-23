import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatINR'

const CATEGORIES = [
  'All',
  'Electronics',
  'Fashion',
  'Grocery',
  'Accessories',
  'Home & Kitchen',
  'Books',
  'Sports & Fitness',
  'Beauty & Personal Care'
]

const AI_SUGGESTIONS = [
  'Noise-cancelling headphones under ₹10,000',
  'Running shoes with cushioning',
  'Smartwatch with heart rate monitor',
  'Organic healthy snacks'
]

export default function Marketplace() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('newest')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [inStockOnly, setInStockOnly] = useState(false)
  
  // AI Shopping Assistant state
  const [aiOpen, setAiOpen] = useState(false)
  const [aiQuery, setAiQuery] = useState('')
  const [aiResponse, setAiResponse] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [cartMsg, setCartMsg] = useState('')

  const { isAuthenticated, user, refreshCartCount } = useAuth()
  const navigate = useNavigate()

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let queryParams = []
      if (searchTerm.trim()) queryParams.push(`search=${encodeURIComponent(searchTerm.trim())}`)
      if (selectedCategory !== 'All') queryParams.push(`category=${encodeURIComponent(selectedCategory)}`)
      if (sortBy) queryParams.push(`sort=${encodeURIComponent(sortBy)}`)
      if (minPrice !== '') queryParams.push(`minPrice=${encodeURIComponent(minPrice)}`)
      if (maxPrice !== '') queryParams.push(`maxPrice=${encodeURIComponent(maxPrice)}`)
      if (inStockOnly) queryParams.push(`inStockOnly=true`)
      
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
    }, 250)

    return () => clearTimeout(delayDebounceFn)
  }, [searchTerm, selectedCategory, sortBy, minPrice, maxPrice, inStockOnly])

  const handleAddToCart = async (productId, productName) => {
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
      setCartMsg(`✓ "${productName || 'Item'}" added to cart!`)
      if (refreshCartCount) refreshCartCount()
      setTimeout(() => setCartMsg(''), 3000)
    } catch (err) {
      alert(err.message || 'Failed to add item to cart')
    }
  }

  const handleAiAsk = async (queryText) => {
    const textToQuery = queryText || aiQuery
    if (!textToQuery.trim()) return
    setAiLoading(true)
    try {
      const data = await apiRequest('/ai/shopping-assistant', 'POST', { query: textToQuery })
      setAiResponse(data)
    } catch (err) {
      setAiResponse({ 
        reply: 'Shopping assistant is currently updating. Try searching directly in the marketplace catalog!',
        recommendations: []
      })
    } finally {
      setAiLoading(false)
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
    setSortBy('newest')
    setMinPrice('')
    setMaxPrice('')
    setInStockOnly(false)
  }

  return (
    <div className="marketplace-container animate-fade-up">
      {/* Page Header */}
      <div className="marketplace-header-row">
        <div>
          <span className="section-subtitle">MULTI-VENDOR CATALOG</span>
          <h1 className="marketplace-title">Explore Marketplace</h1>
          <p className="marketplace-subtitle">
            Authentic products from verified independent vendors across India.
          </p>
        </div>

        <button 
          className="btn-ai-trigger"
          onClick={() => setAiOpen(!aiOpen)}
          aria-expanded={aiOpen}
        >
          <span className="ai-sparkle-icon">✨</span>
          <span>{aiOpen ? 'Close AI Assistant' : 'AI Shopping Assistant'}</span>
        </button>
      </div>

      {cartMsg && <div className="toast-success">{cartMsg}</div>}

      {/* AI Assistant Interactive Drawer */}
      {aiOpen && (
        <div className="ai-assistant-card animate-fade-up">
          <div className="ai-card-header">
            <div className="ai-header-left">
              <span className="ai-bot-avatar">🤖</span>
              <div>
                <h3>VendiSphere AI Shopping Assistant</h3>
                <span className="ai-badge-verified">Verified Real Catalog Recommendations</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setAiOpen(false)} aria-label="Close AI Drawer">✕</button>
          </div>
          
          <p className="ai-card-desc">
            Ask natural language questions like product categories, features, or budget limits (e.g., "Find noise-cancelling headphones under ₹10,000").
          </p>

          {/* Quick Prompt Chips */}
          <div className="ai-prompt-chips">
            <span className="prompt-chips-label">Try asking:</span>
            {AI_SUGGESTIONS.map((suggestion, idx) => (
              <button 
                key={idx}
                type="button"
                className="prompt-chip"
                onClick={() => {
                  setAiQuery(suggestion)
                  handleAiAsk(suggestion)
                }}
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          <form onSubmit={(e) => { e.preventDefault(); handleAiAsk() }} className="ai-form">
            <input 
              type="text"
              placeholder="e.g. Find lightweight sneakers under ₹6,000"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="form-input ai-input"
            />
            <button type="submit" className="btn-primary" disabled={aiLoading || !aiQuery.trim()}>
              {aiLoading ? 'Thinking...' : 'Ask AI'}
            </button>
          </form>

          {aiResponse && (
            <div className="ai-response-box animate-fade-up">
              <div className="ai-reply-bubble">
                <p className="ai-reply">{aiResponse.reply}</p>
                {aiResponse.provider && (
                  <span className="ai-source-tag">Engine: {aiResponse.provider === 'gemini-ai' ? 'Gemini AI ⚡' : 'Local Deterministic Intelligence ⚡'}</span>
                )}
              </div>

              {aiResponse.recommendations && aiResponse.recommendations.length > 0 && (
                <div className="ai-recs-grid">
                  {aiResponse.recommendations.map(r => (
                    <div key={r._id || r.name} className="ai-rec-card">
                      <img 
                        src={r.imageUrl} 
                        alt={r.name} 
                        className="ai-rec-thumb"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Product' }}
                      />
                      <div className="ai-rec-details">
                        <span className="ai-rec-cat">{r.category}</span>
                        <Link to={`/product/${r._id}`} className="ai-rec-name">{r.name}</Link>
                        <span className="ai-rec-price">{formatINR(r.price)}</span>
                        {r.recommendationReason && (
                          <span className="ai-rec-reason">💡 {r.recommendationReason}</span>
                        )}
                      </div>
                      <div className="ai-rec-actions">
                        <Link to={`/product/${r._id}`} className="btn-secondary btn-sm">View</Link>
                        <button 
                          className="btn-primary btn-sm"
                          onClick={() => handleAddToCart(r._id, r.name)}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Filter & Search Control Bar */}
      <div className="marketplace-controls-bar">
        {/* Search input with live clear */}
        <div className="search-box">
          <svg className="search-box-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search products by title, category, or features..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')} title="Clear search">
              ✕
            </button>
          )}
        </div>

        {/* Sorting Dropdown */}
        <div className="filter-select-group">
          <label className="filter-label">Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-dropdown"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Customer Rating</option>
          </select>
        </div>

        {/* Quick Price Range Inputs */}
        <div className="price-range-group">
          <span className="filter-label">Price (₹):</span>
          <input 
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="price-filter-input"
            min="0"
          />
          <span className="range-sep">-</span>
          <input 
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="price-filter-input"
            min="0"
          />
        </div>

        {/* In-Stock Toggle */}
        <label className="checkbox-filter-label">
          <input 
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="checkbox-input"
          />
          <span>In Stock Only</span>
        </label>

        {/* Reset button if any filter is active */}
        {(searchTerm || selectedCategory !== 'All' || minPrice || maxPrice || inStockOnly || sortBy !== 'newest') && (
          <button className="btn-secondary btn-sm" onClick={handleResetFilters}>
            Reset Filters
          </button>
        )}
      </div>

      {/* Category Pills Slider */}
      <div className="category-scroll-wrapper">
        <div className="category-filters">
          {CATEGORIES.map((category) => (
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

      {/* Results Count & Product Grid */}
      <div className="catalog-meta-row">
        <span className="catalog-count-text">
          Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
          {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
        </span>
      </div>

      {loading ? (
        <div className="loading-spinner-container">
          <div className="spinner"></div>
          <p>Finding the best marketplace products for you...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((product) => (
            <div key={product._id} className="marketplace-product-card">
              <div className="product-image-container">
                <Link to={`/product/${product._id}`} className="product-image-link">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="product-card-img" 
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=Product+Image' }}
                    loading="lazy"
                  />
                </Link>
                <span className={`card-stock-pill ${product.stock === 0 ? 'stock-empty' : product.stock <= 5 ? 'stock-warning' : 'stock-available'}`}>
                  {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In Stock'}
                </span>
              </div>

              <div className="product-card-content">
                <div className="product-card-top">
                  <span className="product-category-tag">{product.category}</span>
                  <div className="product-rating-pill">
                    ⭐ {product.rating > 0 ? product.rating : '4.5'}
                  </div>
                </div>

                <Link to={`/product/${product._id}`} className="product-name-link">
                  <h3 className="product-name">{product.name}</h3>
                </Link>

                <p className="product-description">
                  {product.description.length > 85 
                    ? `${product.description.substring(0, 85)}...` 
                    : product.description}
                </p>

                <div className="product-card-vendor">
                  <span>Store: <strong>{product.vendor?.name || 'Verified Vendor'}</strong></span>
                </div>

                <div className="product-card-footer">
                  <span className="product-price">{formatINR(product.price)}</span>
                  
                  <button 
                    className="btn-primary product-action-btn"
                    onClick={() => handleAddToCart(product._id, product.name)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-results">
          <div className="empty-icon">🔍</div>
          <h2>No matching products found</h2>
          <p>We couldn't find any items matching your selected criteria. Try adjusting your filters or price range.</p>
          <button className="btn-primary" onClick={handleResetFilters}>
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  )
}
