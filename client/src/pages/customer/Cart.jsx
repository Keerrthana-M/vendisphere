import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { formatINR } from '../../utils/formatINR'

export default function Cart() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
    } catch (err) {
      alert(err.message || 'Failed to update quantity')
    }
  }

  const handleRemoveItem = async (itemId) => {
    try {
      const updatedData = await apiRequest(`/cart/${itemId}`, 'DELETE')
      setCart(updatedData)
    } catch (err) {
      alert(err.message || 'Failed to remove item')
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading your shopping cart...</p>
      </div>
    )
  }

  const cartItems = cart?.items || []
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product ? item.product.price * item.quantity : 0), 0)

  return (
    <div className="cart-page-container animate-fade-up">
      <h1 className="page-title">Shopping Cart</h1>

      {error && <div className="error-message">{error}</div>}

      {cartItems.length > 0 ? (
        <div className="cart-layout">
          {/* Cart Items List */}
          <div className="cart-items-list">
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
                      Store: <strong>{product.vendor?.name || 'Multi-Vendor Partner'}</strong>
                    </span>
                    <span className="cart-item-price">{formatINR(product.price)} each</span>
                  </div>

                  <div className="cart-item-actions">
                    <div className="quantity-controls">
                      <button 
                        onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                        disabled={product.stock && item.quantity >= product.stock}
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
                      title="Remove item"
                    >
                      🗑️
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
              <span>Subtotal ({cartItems.length} items)</span>
              <strong>{formatINR(subtotal)}</strong>
            </div>

            <div className="summary-row">
              <span>Standard Shipping</span>
              <span className="free-badge">FREE</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row total-row">
              <span>Total</span>
              <span>{formatINR(subtotal)}</span>
            </div>

            <button 
              className="btn-primary btn-lg action-btn-full"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout
            </button>

            <Link to="/marketplace" className="continue-shopping-link">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="empty-results">
          <h2>Your cart is currently empty</h2>
          <p>Explore our marketplace catalog to discover items from independent vendors.</p>
          <Link to="/marketplace" className="btn-primary">
            Explore Marketplace
          </Link>
        </div>
      )}
    </div>
  )
}
