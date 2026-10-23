import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export const Navbar = () => {
  const { user, isAuthenticated, logout, cartCount } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="app-header">
      <div className="navbar">
        <Link to="/" className="brand-container">
          <div className="brand-icon">V</div>
          <div className="brand-details">
            <span className="brand-title">VendiSphere</span>
            <span className="brand-tagline">Smart Multi-Vendor Commerce</span>
          </div>
        </Link>

        <nav className="nav-links">
          {/* Unauthenticated Nav Links */}
          {!isAuthenticated && (
            <>
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Home
              </NavLink>
              <NavLink to="/marketplace" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Marketplace
              </NavLink>
              <NavLink to="/login" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Register
              </NavLink>
            </>
          )}

          {/* Customer Nav Links */}
          {isAuthenticated && user?.role === 'customer' && (
            <>
              <NavLink to="/" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Home
              </NavLink>
              <NavLink to="/marketplace" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Marketplace
              </NavLink>
              <NavLink to="/cart" className={({ isActive }) => isActive ? 'nav-link active nav-link-cart' : 'nav-link nav-link-cart'}>
                Cart
                {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
              </NavLink>
              <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Orders
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Profile
              </NavLink>
            </>
          )}

          {/* Vendor Nav Links */}
          {isAuthenticated && user?.role === 'vendor' && (
            <>
              <NavLink to="/vendor/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Dashboard
              </NavLink>
              <NavLink to="/vendor/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Products
              </NavLink>
              <NavLink to="/vendor/inventory" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Inventory
              </NavLink>
              <NavLink to="/vendor/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Orders
              </NavLink>
              <NavLink to="/vendor/analytics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Analytics
              </NavLink>
              <NavLink to="/vendor/insights" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                AI Insights
              </NavLink>
            </>
          )}

          {/* Admin Nav Links */}
          {isAuthenticated && user?.role === 'admin' && (
            <>
              <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/vendors" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Vendors
              </NavLink>
              <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Users
              </NavLink>
              <NavLink to="/admin/products" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Products
              </NavLink>
              <NavLink to="/admin/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Orders
              </NavLink>
              <NavLink to="/admin/analytics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                Analytics
              </NavLink>
            </>
          )}
        </nav>

        <div className="nav-actions">
          {!isAuthenticated ? (
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          ) : (
            <div className="user-nav-profile">
              <span className="user-badge">{user?.role}</span>
              <button onClick={handleLogout} className="btn-secondary btn-sm">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
