import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatINR'

export default function Checkout() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { user, refreshCartCount } = useAuth()
  const navigate = useNavigate()

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || '',
    address: '12 MG Road',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560001',
    phone: '9876543210'
  })

  const fetchCart = async () => {
    setLoading(true)
    try {
      const data = await apiRequest('/cart')
      if (!data.items || data.items.length === 0) {
        navigate('/cart')
        return
      }
      setCart(data)
    } catch (err) {
      setError(err.message || 'Failed to load checkout cart')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value
    })
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await apiRequest('/orders', 'POST', { shippingAddress })
      if (refreshCartCount) refreshCartCount()
      navigate(`/orders/${res.order._id}`)
    } catch (err) {
      setError(err.message || 'Failed to place order. Please review your details and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="checkout-container animate-fade-up">
        <h1 className="page-title">Checkout</h1>
        <div className="checkout-layout" style={{ marginTop: '1.5rem' }}>
          <div className="skeleton-card" style={{ height: '360px' }}>
            <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
          </div>
          <div className="skeleton-card" style={{ height: '280px' }}>
            <div className="skeleton-shimmer" style={{ width: '100%', height: '100%' }}></div>
          </div>
        </div>
      </div>
    )
  }

  const cartItems = cart?.items || []
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product ? item.product.price * item.quantity : 0), 0)

  return (
    <div className="checkout-container animate-fade-up">
      {/* Checkout Progress Stepper */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Checkout</h1>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>Provide delivery details to confirm your order.</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.86rem', fontWeight: 600 }}>
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>✓</span> Cart
          </span>
          <span style={{ color: '#cbd5e1' }}>→</span>
          <span style={{ color: '#4f46e5', background: '#e0e7ff', padding: '3px 10px', borderRadius: '12px' }}>
            2. Shipping & Review
          </span>
          <span style={{ color: '#cbd5e1' }}>→</span>
          <span style={{ color: '#94a3b8' }}>
            3. Confirmation
          </span>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>{error}</span>
        </div>
      )}

      <div className="checkout-layout">
        {/* Shipping Address Form */}
        <div className="checkout-form-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
              1
            </span>
            <h2 className="form-card-title" style={{ margin: 0 }}>Shipping Address</h2>
          </div>

          <form onSubmit={handlePlaceOrder} id="checkout-form" className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input 
                type="text" 
                name="fullName"
                className="form-input"
                placeholder="Recipient name"
                value={shippingAddress.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input 
                type="text" 
                name="address"
                className="form-input"
                placeholder="House / Flat / Street name"
                value={shippingAddress.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input 
                  type="text" 
                  name="city"
                  className="form-input"
                  placeholder="e.g. Bengaluru"
                  value={shippingAddress.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">State / Region *</label>
                <input 
                  type="text" 
                  name="state"
                  className="form-input"
                  placeholder="e.g. Karnataka"
                  value={shippingAddress.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Postal / PIN Code *</label>
                <input 
                  type="text" 
                  name="postalCode"
                  className="form-input"
                  placeholder="560001"
                  value={shippingAddress.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input 
                  type="tel" 
                  name="phone"
                  className="form-input"
                  placeholder="9876543210"
                  value={shippingAddress.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="demo-payment-notice">
              🔒 <strong>Demo Order Confirmation:</strong> Real payment gateway credentials are not required for this demo environment. Clicking <em>"Place Order"</em> records your transaction in MongoDB with atomic inventory decrement and generates your official receipt.
            </div>
          </form>
        </div>

        {/* Order Review Sidebar */}
        <div className="checkout-summary-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <span style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
              2
            </span>
            <h2 className="summary-title" style={{ margin: 0 }}>Order Summary</h2>
          </div>

          <div className="checkout-items-mini">
            {cartItems.map(item => (
              <div key={item._id} className="mini-item-row" style={{ padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                <div className="mini-item-details">
                  <span className="mini-item-name">{item.product?.name}</span>
                  <span className="mini-item-qty">Qty: {item.quantity} × {formatINR(item.product?.price || 0)}</span>
                </div>
                <span className="mini-item-price">{formatINR((item.product?.price || 0) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="summary-row" style={{ marginTop: '0.5rem' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Items Subtotal</span>
            <span style={{ fontWeight: 600 }}>{formatINR(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Delivery</span>
            <span className="free-badge">FREE</span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row total-row">
            <span>Total Payable</span>
            <span>{formatINR(subtotal)}</span>
          </div>

          <button 
            type="submit" 
            form="checkout-form"
            className="btn-primary btn-lg action-btn-full"
            disabled={submitting}
            style={{ marginTop: '0.5rem' }}
          >
            {submitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                Placing Your Order...
              </span>
            ) : 'Place Order & Get Receipt →'}
          </button>

          <Link to="/cart" style={{ textAlign: 'center', color: '#64748b', fontSize: '0.86rem', marginTop: '0.5rem' }}>
            ← Return to Cart
          </Link>
        </div>
      </div>
    </div>
  )
}
