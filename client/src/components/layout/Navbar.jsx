import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const Navbar = () => {
  const { user, isAuthenticated, logout, cartCount } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setMobileMenuOpen(false)
    navigate('/')
  }

  const closeMobile = () => setMobileMenuOpen(false)

  const getInitials = (name) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <header className="app-header">
      <div className="navbar">
        {/* Brand Logo */}
        <Link to="/" className="brand-container" onClick={closeMobile}>
          <div className="brand-icon">
            <span>V</span>
          </div>
          <div className="brand-details">
            <span className="brand-title">VendiSphere</span>
            <span className="brand-tagline">Multi-Vendor &amp; Intelligence</span>
          </div>
        </Link>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>

        {/* Desktop Navigation Links */}
        <nav className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          {/* Public / Unauthenticated */}
          {!isAuthenticated && (
            <>
              <NavLink to="/" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Home
              </NavLink>
              <NavLink to="/marketplace" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Explore Marketplace
              </NavLink>
            </>
          )}

          {/* Customer Links */}
          {isAuthenticated && user?.role === 'customer' && (
            <>
              <NavLink to="/marketplace" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Marketplace
              </NavLink>
              <NavLink to="/orders" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                My Orders
              </NavLink>
              <NavLink to="/profile" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Profile
              </NavLink>
            </>
          )}

          {/* Vendor Links */}
          {isAuthenticated && user?.role === 'vendor' && (
            <>
              <NavLink to="/vendor/dashboard" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Overview
              </NavLink>
              <NavLink to="/vendor/products" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Products
              </NavLink>
              <NavLink to="/vendor/inventory" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Smart Inventory
              </NavLink>
              <NavLink to="/vendor/orders" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Orders
              </NavLink>
              <NavLink to="/vendor/analytics" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Analytics
              </NavLink>
              <NavLink to="/vendor/insights" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                ✨ AI Insights
              </NavLink>
            </>
          )}

          {/* Admin Links */}
          {isAuthenticated && user?.role === 'admin' && (
            <>
              <NavLink to="/admin/dashboard" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/vendors" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Vendors
              </NavLink>
              <NavLink to="/admin/users" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Users
              </NavLink>
              <NavLink to="/admin/products" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Products
              </NavLink>
              <NavLink to="/admin/orders" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Transactions
              </NavLink>
              <NavLink to="/admin/analytics" onClick={closeMobile} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Analytics
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Actions: Cart & Profile / Auth Buttons */}
        <div className="nav-actions">
          {/* Customer Cart Button */}
          {(!isAuthenticated || user?.role === 'customer') && (
            <Link to="/cart" className="nav-cart-btn" aria-label="Shopping Cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="cart-text-label">Cart</span>
              {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
            </Link>
          )}

          {!isAuthenticated ? (
            <div className="auth-buttons-group">
              <Link to="/login" className="btn-nav-login">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                Join Marketplace
              </Link>
            </div>
          ) : (
            <div className="user-profile-widget">
              <div className="user-avatar-initials">
                {getInitials(user?.name)}
              </div>
              <div className="user-info-meta">
                <span className="user-display-name">{user?.name}</span>
                <span className={`user-role-chip role-${user?.role}`}>
                  {user?.role === 'vendor' ? 'Storefront' : user?.role}
                </span>
              </div>
              <button 
                onClick={handleLogout} 
                className="btn-logout"
                title="Sign out of your account"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span>Exit</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
