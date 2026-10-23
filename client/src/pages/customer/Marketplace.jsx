import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatINR'

const CATEGORIES = [
  { name: 'All', icon: '✦' },
  { name: 'Electronics', icon: '💻' },
  { name: 'Fashion', icon: '👕' },
  { name: 'Grocery', icon: '🥑' },
  { name: 'Accessories', icon: '⌚' },
  { name: 'Home & Kitchen', icon: '🍳' },
  { name: 'Books', icon: '📚' },
  { name: 'Sports & Fitness', icon: '🏃' },
  { name: 'Beauty & Personal Care', icon: '✨' }
]

const AI_SUGGESTIONS = [
  'Noise-cancelling headphones under ₹10,000',
  'Running shoes with cushioning',
  'Smartwatch with heart rate monitor',
  'Organic healthy snacks'
]

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || 'All'

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
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

  // Sync state if URL query params change
  useEffect(() => {
    const urlCategory = searchParams.get('category')
    const urlSearch = searchParams.get('search')
    if (urlCategory && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory)
    }
    if (urlSearch !== null && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch)
    }
  }, [searchParams])

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
      setCartMsg(`✓ "${productName || 'Item'}" added to your cart!`)
      if (refreshCartCount) refreshCartCount()
      setTimeout(() => setCartMsg(''), 3500)
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
    setSearchParams({})
  }

  return (
    <div className="marketplace-container animate-fade-up">
      {/* Top Banner & Header */}
      <div className="marketplace-header-row">
        <div>
          <span className="section-subtitle">AUTHENTIC MULTI-VENDOR COMMERCE</span>
          <h1 className="marketplace-title">Explore Marketplace</h1>
          <p className="marketplace-subtitle">
            Curated products directly from approved, independent stores across India.
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

      {cartMsg && (
        <div className="toast-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{cartMsg}</span>
          <Link to="/cart" style={{ color: '#047857', fontWeight: 700, textDecoration: 'underline', fontSize: '0.9rem' }}>
            View Cart →
          </Link>
        </div>
      )}

      {/* AI Assistant Interactive Drawer */}
      {aiOpen && (
        <div className="ai-assistant-card animate-fade-up">
          <div className="ai-card-header">
            <div className="ai-header-left">
              <span className="ai-bot-avatar">🤖</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>VendiSphere AI Shopping Assistant</h3>
                <span className="ai-badge-verified">Verified Real Catalog Recommendations</span>
              </div>
            </div>
            <button className="close-btn" onClick={() => setAiOpen(false)} aria-label="Close AI Drawer">✕</button>
          </div>
          
          <p className="ai-card-desc" style={{ color: '#475569', fontSize: '0.92rem', margin: 0 }}>
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

          {aiLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
              <span style={{ fontSize: '0.9rem', color: '#4f46e5', fontWeight: 600 }}>Analyzing marketplace inventory and budget criteria...</span>
            </div>
          )}

          {aiResponse && !aiLoading && (
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
        <div className="search-box" style={{ flex: '1 1 280px' }}>
          <svg className="search-box-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search products by name, category, or features..."
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
          <label className="filter-label">Sort:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-dropdown"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated</option>
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
            Reset
          </button>
        )}
      </div>

      {/* Category Pills Slider with Icons */}
      <div className="category-scroll-wrapper">
        <div className="category-filters">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              className={`category-btn ${selectedCategory === cat.name ? 'active' : ''}`}
              onClick={() => {
                setSelectedCategory(cat.name)
                if (cat.name === 'All') {
                  setSearchParams({})
                } else {
                  setSearchParams({ category: cat.name })
                }
              }}
            >
              <span style={{ marginRight: '6px' }}>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Meta */}
      <div className="catalog-meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="catalog-count-text">
          Showing <strong>{products.length}</strong> {products.length === 1 ? 'product' : 'products'}
          {selectedCategory !== 'All' ? ` in "${selectedCategory}"` : ''}
          {searchTerm ? ` matching "${searchTerm}"` : ''}
        </span>
      </div>

      {/* Product Grid or Skeleton Loaders */}
      {loading ? (
        <div className="product-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="skeleton-card">
              <div className="skeleton-shimmer skeleton-img"></div>
              <div className="skeleton-body">
                <div className="skeleton-shimmer skeleton-pill"></div>
                <div className="skeleton-shimmer skeleton-title"></div>
                <div className="skeleton-shimmer skeleton-text"></div>
                <div className="skeleton-shimmer skeleton-text short"></div>
                <div className="skeleton-footer">
                  <div className="skeleton-shimmer skeleton-price"></div>
                  <div className="skeleton-shimmer skeleton-btn"></div>
                </div>
              </div>
            </div>
          ))}
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
                  <span>Store: <strong>{product.vendor?.name || 'Verified Partner'}</strong></span>
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
        <div className="empty-results" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
            🔍
          </div>
          <h2>No matching products found</h2>
          <p>We couldn't find any items matching your criteria. Try adjusting your search keywords, category, or price range.</p>
          <button className="btn-primary" onClick={handleResetFilters}>
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  )
}
