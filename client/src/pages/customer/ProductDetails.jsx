import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
      alert('Only customers can add items to cart.')
      return
    }

    try {
      await apiRequest('/cart', 'POST', { productId: product._id, quantity })
      setActionMsg(`✓ ${quantity} item(s) added to cart!`)
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
      setActionMsg('Thank you for your review!')
      fetchProductData() // Refresh product rating & reviews list
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review')
    } finally {
      setReviewSubmitting(false)
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

  if (error || !product) {
    return (
      <div className="empty-results">
        <h2>Product Not Found</h2>
        <p>{error || 'The product you are looking for does not exist.'}</p>
        <button className="btn-primary" onClick={() => navigate('/marketplace')}>
          Back to Marketplace
        </button>
      </div>
    )
  }

  return (
    <div className="product-details-container animate-fade-up">
      {actionMsg && <div className="toast-success">{actionMsg}</div>}

      <div className="product-details-main">
        {/* Product Image */}
        <div className="product-details-image-box">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="product-details-img"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/600x500?text=Product+Image' }}
          />
        </div>

        {/* Product Meta & Actions */}
        <div className="product-details-info">
          <span className="product-category-tag">{product.category}</span>
          <h1 className="product-details-title">{product.name}</h1>
          
          <div className="product-vendor-badge">
            Sold by: <strong>{product.vendorBusinessName || product.vendor?.name}</strong>
          </div>

          <div className="product-price-row">
            <span className="product-details-price">{formatINR(product.price)}</span>
            <span className={`stock-status-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
              {product.stock > 0 ? `In Stock (${product.stock} available)` : 'Out of Stock'}
            </span>
          </div>

          <div className="product-rating-summary">
            ⭐ <strong>{product.rating > 0 ? product.rating : 'New'}</strong> ({product.reviewCount || 0} reviews)
          </div>

          <p className="product-details-description">{product.description}</p>

          {/* Add to Cart Section */}
          <div className="cart-action-box">
            <div className="quantity-selector">
              <label className="form-label">Quantity:</label>
              <div className="qty-counter">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>

            <button 
              className="btn-primary btn-lg action-btn-full"
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
            >
              Add {quantity} to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Product Reviews Section */}
      <div className="product-reviews-section">
        <h2 className="reviews-title">Customer Reviews & Ratings</h2>

        {/* Write Review Form */}
        {isAuthenticated && user?.role === 'customer' && (
          <div className="add-review-card">
            <h3>Write a Review</h3>
            <p className="review-sub">Only verified buyers can post product feedback.</p>

            {reviewError && <div className="error-message">{reviewError}</div>}

            <form onSubmit={handleAddReview} className="review-form">
              <div className="form-group">
                <label className="form-label">Rating (1 to 5 Stars):</label>
                <select 
                  value={rating} 
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="form-input"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                  <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  <option value={2}>⭐⭐ (2 Stars)</option>
                  <option value={1}>⭐ (1 Star)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Comment:</label>
                <textarea 
                  rows="3"
                  className="form-input"
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-secondary" disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
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
                  <strong>{r.user?.name || 'Verified Shopper'}</strong>
                  <span className="review-stars">{'⭐'.repeat(r.rating)}</span>
                </div>
                <p className="review-comment">{r.comment}</p>
                <span className="review-date">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            ))
          ) : (
            <p className="no-reviews-msg">No customer reviews yet for this product.</p>
          )}
        </div>
      </div>
    </div>
  )
}
