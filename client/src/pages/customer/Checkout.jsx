import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiRequest } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { formatINR } from '../../utils/formatINR'

export default function Checkout() {
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { user } = useAuth()
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
      alert(`Order placed successfully! Order ID: ${res.order._id}`)
      navigate(`/orders/${res.order._id}`)
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-spinner-container">
        <div className="spinner"></div>
        <p>Loading checkout...</p>
      </div>
    )
  }

  const cartItems = cart?.items || []
  const subtotal = cartItems.reduce((sum, item) => sum + (item.product ? item.product.price * item.quantity : 0), 0)

  return (
    <div className="checkout-container animate-fade-up">
      <h1 className="page-title">Checkout</h1>
      <p className="page-subtitle">Complete your shipping information to place your order.</p>

      {error && <div className="error-message">{error}</div>}

      <div className="checkout-layout">
        {/* Shipping Address Form */}
        <div className="checkout-form-card">
          <h2 className="form-card-title">1. Shipping Address</h2>

          <form onSubmit={handlePlaceOrder} id="checkout-form" className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                type="text" 
                name="fullName"
                className="form-input"
                value={shippingAddress.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Street Address</label>
              <input 
                type="text" 
                name="address"
                className="form-input"
                value={shippingAddress.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">City</label>
                <input 
                  type="text" 
                  name="city"
                  className="form-input"
                  value={shippingAddress.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">State / Province</label>
                <input 
                  type="text" 
                  name="state"
                  className="form-input"
                  value={shippingAddress.state}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Postal Code</label>
                <input 
                  type="text" 
                  name="postalCode"
                  className="form-input"
                  value={shippingAddress.postalCode}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  name="phone"
                  className="form-input"
                  value={shippingAddress.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="demo-payment-notice">
              🔒 <strong>Demo Order Placement Flow</strong>: No real payment gateway is required for this demo version. Clicking "Place Order" records your order in MongoDB, updates vendor inventory, and clears your cart.
            </div>
          </form>
        </div>

        {/* Order Review Sidebar */}
        <div className="checkout-summary-card">
          <h2 className="summary-title">2. Order Review</h2>

          <div className="checkout-items-mini">
            {cartItems.map(item => (
              <div key={item._id} className="mini-item-row">
                <div className="mini-item-details">
                  <span className="mini-item-name">{item.product?.name}</span>
                  <span className="mini-item-qty">Qty: {item.quantity}</span>
                </div>
                <span className="mini-item-price">{formatINR((item.product?.price || 0) * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="summary-divider"></div>

          <div className="summary-row total-row">
            <span>Total Amount Due</span>
            <span>{formatINR(subtotal)}</span>
          </div>

          <button 
            type="submit" 
            form="checkout-form"
            className="btn-primary btn-lg action-btn-full"
            disabled={submitting}
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  )
}
