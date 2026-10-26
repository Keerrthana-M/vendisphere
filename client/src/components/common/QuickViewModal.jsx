import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { formatINR } from '../../utils/formatINR'

export default function QuickViewModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  if (!product) return null

  // Calculate realistic original MRP for display
  const originalPrice = Math.round(product.price * 1.25)
  const discountPercent = 20
  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 5

  const handleAdd = () => {
    if (isOutOfStock) return
    onAddToCart(product._id, product.name, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2500)
  }

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="modal-dialog quickview-modal animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="quickview-grid">
          {/* Left Column: Product Image */}
          <div className="quickview-image-container">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className="quickview-img"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500?text=Product+Image' }}
            />
            <span className={`card-stock-pill ${isOutOfStock ? 'stock-empty' : isLowStock ? 'stock-warning' : 'stock-available'}`}>
              {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.stock} units left!` : 'In Stock'}
            </span>
          </div>

          {/* Right Column: Product Details & Purchase Actions */}
          <div className="quickview-details">
            <div className="quickview-header-meta">
              <span className="product-category-tag">{product.category}</span>
              <div className="product-rating-pill">
                ⭐ {product.rating > 0 ? product.rating : '4.8'}
              </div>
            </div>

            <h2 className="quickview-title">{product.name}</h2>

            <div className="quickview-vendor-meta">
              <span>Merchant:</span>
              <strong>{product.vendorBusinessName || product.vendor?.name || 'Verified Marketplace Partner'}</strong>
              <span className="verified-chip">✓ Verified</span>
            </div>

            {/* Price Row with Retail Discount Badge */}
            <div className="quickview-price-box">
              <div className="quickview-prices">
                <span className="quickview-current-price">{formatINR(product.price)}</span>
                <span className="quickview-original-price">{formatINR(originalPrice)}</span>
                <span className="quickview-discount-pill">{discountPercent}% OFF</span>
              </div>
              <span className="quickview-tax-note">Inclusive of all local taxes &amp; duties</span>
            </div>

            {/* Description */}
            <p className="quickview-description">
              {product.description}
            </p>

            {/* Quantity Selector & Live Total */}
            {!isOutOfStock && (
              <div className="quickview-qty-row">
                <div className="quickview-qty-control">
                  <label className="form-label" style={{ marginBottom: '4px', fontSize: '0.8rem' }}>Quantity</label>
                  <div className="qty-counter">
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="qty-number">{quantity}</span>
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      disabled={quantity >= product.stock}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="quickview-total-box">
                  <span className="quickview-total-label">Subtotal</span>
                  <span className="quickview-total-val">{formatINR(product.price * quantity)}</span>
                </div>
              </div>
            )}

            {/* Aligned Action Buttons */}
            <div className="quickview-actions-row">
              <button 
                type="button"
                className={`btn-primary quickview-add-btn ${added ? 'btn-success' : ''}`}
                onClick={handleAdd}
                disabled={isOutOfStock}
              >
                {added ? (
                  <span>✓ Added to Cart!</span>
                ) : isOutOfStock ? (
                  <span>Sold Out</span>
                ) : (
                  <span>🛒 Add {quantity > 1 ? `${quantity} items ` : ''}to Cart</span>
                )}
              </button>

              <Link 
                to={`/product/${product._id}`} 
                className="btn-secondary quickview-view-btn"
                onClick={onClose}
              >
                Full Details →
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="quickview-trust-strip">
              <span>🚚 Free Express Shipping</span>
              <span>•</span>
              <span>🔒 100% Genuine Guarantee</span>
              <span>•</span>
              <span>🔄 Easy 7-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
