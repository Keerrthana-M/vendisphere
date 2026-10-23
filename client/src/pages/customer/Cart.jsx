import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatINR'

export default function Cart() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { refreshCartCount } = useAuth()
  const navigate = useNavigate()

  const fetchCart = async () => {
    setLoading(true)
    try {
      const data = await apiRequest('/cart')
      setCart(data)
    } catch (err) {
      setError(err.message || 'Failed to load shopping cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      const updatedData = await apiRequest(`/cart/${itemId}`, 'PUT', { quantity: newQuantity })
      setCart(updatedData)
      if (refreshCartCount) refreshCartCount()
    } catch (err) {
      alert(err.message || 'Failed to update quantity')
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      const updatedData = await apiRequest(`/cart/${itemId}`, 'DELETE')
      setCart(updatedData)
      if (refreshCartCount) refreshCartCount()
    } catch (err) {
      alert(err.message || 'Failed to remove item')
    }
  }

  if (loading) {
    return (
      <div className="cart-page-container animate-fade-up">
        <h1 className="page-title">Shopping Cart</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2].map(n => (
              <div key={n} className="skeleton-card" style={{ height: '110px', padding: '1rem', display: 'flex', flexDirection: 'row', gap: '1rem' }}>
                <div className="skeleton-shimmer" style={{ width: '80px', height: '80px', borderRadius: '12px' }}></div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div className="skeleton-shimmer skeleton-title" style={{ width: '60%' }}></div>
                  <div className="skeleton-shimmer skeleton-text" style={{ width: '30%' }}></div>
                </div>
              </div>
            ))}
          </div>
          <div className="skeleton-card" style={{ height: '240px' }}>
            <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  const cartItems = cart?.items || []
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product ? item.product.price * item.quantity : 0), 0)
  const totalItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="cart-page-container animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Shopping Cart</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
            Review items from independent marketplace vendors before checking out.
          </p>
        </div>
        {cartItems.length > 0 && (
          <span style={{ fontSize: '0.92rem', color: '#64748b' }}>
            <strong>{totalItemCount}</strong> item{totalItemCount === 1 ? '' : 's'} in cart
          </span>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {cartItems.length > 0 ? (
        <div className="cart-layout">
          {/* Cart Items List */}
          <div className="cart-items-list">
            {/* Free shipping banner */}
            <div className="free-shipping-card">
              <div className="free-shipping-text">
                <span>🎉</span>
                <span>Your order qualifies for <strong>FREE Express Standard Delivery</strong>!</span>
              </div>
              <div className="free-shipping-bar">
                <div className="free-shipping-progress" style={{ width: '100%' }}></div>
              </div>
            </div>

            {cartItems.map((item) => {
              const product = item.product
              if (!product) return null

              return (
                <div key={item._id} className="cart-item-card">
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    className="cart-item-img"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/150?text=Product' }}
                  />

                  <div className="cart-item-info">
                    <Link to={`/product/${product._id}`} className="cart-item-title">
                      {product.name}
                    </Link>
                    <span className="cart-item-vendor">
                      Vendor Store: <strong>{product.vendor?.name || 'Verified Multi-Vendor Partner'}</strong>
                    </span>
                    <span className="cart-item-price">{formatINR(product.price)} each</span>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700 }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        disabled={product.stock && item.quantity >= product.stock}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    <span className="cart-item-total">
                      {formatINR(product.price * item.quantity)}
                    </span>

                    <button 
                      className="remove-btn" 
                      onClick={() => handleRemoveItem(item._id)}
                      title="Remove item from cart"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Cart Summary Side Card */}
          <div className="cart-summary-card">
            <h2 className="summary-title">Order Summary</h2>

            <div className="summary-row">
              <span style={{ color: '#475569' }}>Items Subtotal ({totalItemCount} items)</span>
              <strong style={{ color: '#0f172a' }}>{formatINR(subtotal)}</strong>
            </div>

            <div className="summary-row">
              <span style={{ color: '#475569' }}>Estimated Shipping</span>
              <span className="free-badge">FREE</span>
            </div>

            <div className="summary-row">
              <span style={{ color: '#475569' }}>Platform Service Fee</span>
              <span style={{ color: '#059669', fontWeight: 600 }}>₹0</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Total Amount</span>
              <span>{formatINR(subtotal)}</span>
            </div>

            <button 
              className="btn-primary btn-lg action-btn-full"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout →
            </button>

            <Link to="/marketplace" className="continue-shopping-link">
              ← Continue Shopping
            </Link>

            <div style={{ marginTop: '0.5rem', padding: '10px', background: '#f8fafc', borderRadius: '10px', fontSize: '0.78rem', color: '#64748b', textAlign: 'center' }}>
              🔒 256-bit Encrypted Checkout • Verified Sellers
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-results" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>
            🛒
          </div>
          <h2>Your cart is currently empty</h2>
          <p>Explore our marketplace catalog to discover products from independent vendors across India.</p>
          <Link to="/marketplace" className="btn-primary btn-lg">
            Explore Marketplace Now →
          </Link>
        </div>
      )}
    </div>
  )
}
