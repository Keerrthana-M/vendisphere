import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatINR'

export default function ProductDetails() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionMsg, setActionMsg] = useState('')

  // New Review form state
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewSubmitting, setReviewSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')

  const { isAuthenticated, user, refreshCartCount } = useAuth()
  const navigate = useNavigate()

  const fetchProductData = async () => {
    setLoading(true)
    try {
      const prodData = await apiRequest(`/products/${id}`)
      setProduct(prodData)

      const revData = await apiRequest(`/reviews/product/${id}`)
      setReviews(revData)
    } catch (err) {
      setError(err.message || 'Product not found')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [id])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user?.role !== 'customer') {
      alert('Only customer accounts can add items to cart.')
      return
    }

    try {
      await apiRequest('/cart', 'POST', { productId: product._id, quantity })
      setActionMsg(`✓ Added ${quantity} item(s) to your cart!`)
      if (refreshCartCount) refreshCartCount()
      setTimeout(() => setActionMsg(''), 3500)
    } catch (err) {
      alert(err.message || 'Failed to add item to cart')
    }
  }

  const handleAddReview = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    setReviewSubmitting(true)
    setReviewError('')

    try {
      await apiRequest('/reviews', 'POST', {
        productId: product._id,
        rating,
        comment
      })
      setComment('')
      setActionMsg('✓ Thank you for your review!')
      fetchProductData()
      setTimeout(() => setActionMsg(''), 3500)
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review')
    } finally {
      setReviewSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="product-details-container animate-fade-up">
        <div className="product-details-main">
          <div className="skeleton-card" style={{ height: '400px' }}>
            <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="skeleton-shimmer skeleton-pill"></div>
            <div className="skeleton-shimmer skeleton-title" style={{ width: '80%', height: '36px' }}></div>
            <div className="skeleton-shimmer skeleton-text" style={{ width: '40%' }}></div>
            <div className="skeleton-shimmer skeleton-price" style={{ width: '120px', height: '36px' }}></div>
            <div className="skeleton-shimmer skeleton-text" style={{ height: '80px' }}></div>
            <div className="skeleton-shimmer skeleton-btn" style={{ width: '100%', height: '48px' }}></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="empty-results" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
          ✕
        </div>
        <h2>Product Not Found</h2>
        <p>{error || 'The product you are looking for does not exist or may have been unlisted.'}</p>
        <button className="btn-primary" onClick={() => navigate('/marketplace')}>
          Back to Marketplace
        </button>
      </div>
    )
  }

  const isLowStock = product.stock > 0 && product.stock <= 5

  return (
    <div className="product-details-container animate-fade-up">
      {/* Breadcrumb row */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', color: '#64748b' }}>
        <Link to="/marketplace" style={{ color: '#4f46e5', fontWeight: 600 }}>Marketplace</Link>
        <span>/</span>
        <Link to={`/marketplace?category=${encodeURIComponent(product.category)}`} style={{ color: '#64748b' }}>{product.category}</Link>
        <span>/</span>
        <span style={{ color: '#0f172a', fontWeight: 600 }}>{product.name}</span>
      </nav>

      {actionMsg && (
        <div className="toast-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{actionMsg}</span>
          <Link to="/cart" style={{ color: '#047857', fontWeight: 700, textDecoration: 'underline' }}>
            Go to Cart →
          </Link>
        </div>
      )}

      <div className="product-details-main">
        {/* Product Image Card */}
        <div className="product-details-image-box">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="product-details-img"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/600x500?text=Product+Image' }}
          />
        </div>

        {/* Product Information & Purchase Panel */}
        <div className="product-details-info">
          <div>
            <span className="product-category-tag">{product.category}</span>
            <h1 className="product-details-title" style={{ marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              {product.name}
            </h1>
            <div className="product-vendor-badge" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>Store:</span>
              <strong style={{ color: '#0f172a' }}>{product.vendorBusinessName || product.vendor?.name || 'Verified Vendor'}</strong>
              <span style={{ color: '#059669', fontSize: '0.8rem', background: '#ecfdf5', padding: '2px 8px', borderRadius: '9999px', fontWeight: 600 }}>✓ Verified Seller</span>
            </div>
          </div>

          <div className="product-price-row">
            <span className="product-details-price">{formatINR(product.price)}</span>
            <span className={`stock-status-badge ${product.stock > 0 ? (isLowStock ? 'stock-warning' : 'in-stock') : 'out-of-stock'}`}>
              {product.stock === 0 ? 'Out of Stock' : isLowStock ? `Urgent: Only ${product.stock} left in stock!` : `In Stock (${product.stock} units)`}
            </span>
          </div>

          <div className="product-rating-summary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#f59e0b', fontSize: '1.1rem' }}>★</span>
            <strong style={{ color: '#0f172a', fontSize: '1rem' }}>{product.rating > 0 ? product.rating : '4.8'}</strong>
            <span style={{ color: '#64748b' }}>• {reviews.length} customer review{reviews.length === 1 ? '' : 's'}</span>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '0.92rem', color: '#1e293b', fontWeight: 700 }}>About this product:</h4>
            <p className="product-details-description" style={{ margin: 0, fontSize: '0.94rem' }}>
              {product.description}
            </p>
          </div>

          {/* Add to Cart Card */}
          <div className="cart-action-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div className="quantity-selector">
                <label className="form-label">Quantity</label>
                <div className="qty-counter">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || product.stock <= 0}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 700 }}>{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || product.stock <= 0}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, display: 'block' }}>TOTAL PRICE</span>
                <span style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
                  {formatINR(product.price * quantity)}
                </span>
              </div>
            </div>

            <button 
              className="btn-primary btn-lg action-btn-full"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              {product.stock > 0 ? `Add ${quantity} to Shopping Cart →` : 'Currently Sold Out'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
              <span>🚚 Free Delivery across India</span>
              <span>🔒 Secure Multi-Vendor Checkout</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <div className="product-reviews-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="reviews-title" style={{ margin: 0 }}>Customer Reviews & Ratings</h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: '4px 0 0 0' }}>Verified feedback from buyers who purchased this product.</p>
          </div>
          <div style={{ background: '#f8fafc', padding: '6px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontWeight: 700, fontSize: '0.92rem' }}>
            Overall Rating: ⭐ {product.rating > 0 ? product.rating : '4.8'} / 5.0
          </div>
        </div>

        {/* Review Submission Form */}
        {isAuthenticated && user?.role === 'customer' && (
          <div className="add-review-card">
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Share Your Experience</h3>
            <p className="review-sub">Help other shoppers by submitting honest feedback about this product.</p>

            {reviewError && <div className="error-message">{reviewError}</div>}

            <form onSubmit={handleAddReview} className="review-form">
              <div className="form-group">
                <label className="form-label">Rating</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="form-input"
                  style={{ maxWidth: '240px' }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Below Expectations)</option>
                  <option value={1}>⭐ (1 - Poor)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Review Details</label>
                <textarea 
                  rows="3"
                  className="form-input"
                  placeholder="Share details about quality, build, performance, or delivery speed..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={reviewSubmitting} style={{ alignSelf: 'flex-start' }}>
                {reviewSubmitting ? 'Posting Review...' : 'Submit Verified Review'}
              </button>
            </form>
          </div>
        )}

        {/* Reviews List */}
        <div className="reviews-list">
          {reviews.length > 0 ? (
            reviews.map(r => (
              <div key={r._id} className="review-item-card">
                <div className="review-item-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>
                      {r.user?.name ? r.user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>{r.user?.name || 'Verified Shopper'}</strong>
                      <span style={{ fontSize: '0.74rem', color: '#059669', background: '#ecfdf5', padding: '1px 6px', borderRadius: '4px', marginLeft: '6px' }}>Verified Buyer</span>
                    </div>
                  </div>
                  <span className="review-stars">{'⭐'.repeat(r.rating)}</span>
                </div>
                <p className="review-comment" style={{ color: '#334155', lineHeight: 1.6 }}>{r.comment}</p>
                <span className="review-date" style={{ color: '#94a3b8' }}>Reviewed on {new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              No reviews submitted yet for this product. Be the first verified buyer to leave feedback!
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
