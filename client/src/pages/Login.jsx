import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const loggedUser = await login(email, password)
      if (loggedUser.role === 'vendor') {
        navigate('/vendor/dashboard')
      } else if (loggedUser.role === 'admin') {
        navigate('/admin/dashboard')
      } else {
        navigate('/marketplace')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError('')
  }

  return (
    <div className="auth-page animate-fade-up">
      <div className="auth-split-wrapper">
        {/* Left Side: Brand Showcase Panel */}
        <div className="auth-side-brand-panel">
          <div className="auth-brand-logo">
            <div className="brand-icon">V</div>
            <span className="auth-brand-name">VendiSphere</span>
          </div>

          <div className="auth-side-content">
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a5b4fc' }}>
              INTELLIGENT E-COMMERCE
            </span>
            <h2 className="auth-side-headline">
              One platform for smart shoppers & verified vendors.
            </h2>
            <p className="auth-side-subtext">
              Log in to manage orders, explore catalog recommendations, or oversee store inventory and analytics.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Unified shopping across multiple independent stores</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Smart 14-day velocity inventory predictions</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>Natural language AI shopping recommendations</span>
              </div>
            </div>
          </div>

          <div className="auth-side-footer-note">
            © 2026 VendiSphere Platform. Secured with encrypted tokens.
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="auth-form-panel">
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Welcome back
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
              Enter your credentials to access your VendiSphere account.
            </p>
          </div>

          {error && (
            <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="loginEmail">Email Address</label>
              <input 
                id="loginEmail" 
                type="email" 
                className="form-input" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="loginPassword">Password</label>
              <div className="password-input-wrapper">
                <input 
                  id="loginPassword" 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-input" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-btn btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                  Authenticating...
                </span>
              ) : 'Sign In to Account →'}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="demo-accounts-box">
            <span className="demo-title">⚡ Quick 1-Click Demo Login:</span>
            <div className="demo-buttons">
              <button 
                type="button" 
                className="btn-secondary btn-sm"
                onClick={() => handleDemoFill('customer@vendisphere.com', 'password123')}
              >
                🛍️ Customer
              </button>
              <button 
                type="button" 
                className="btn-secondary btn-sm"
                onClick={() => handleDemoFill('techvendor@vendisphere.com', 'password123')}
              >
                🏪 Active Vendor
              </button>
              <button 
                type="button" 
                className="btn-secondary btn-sm"
                onClick={() => handleDemoFill('pendingvendor@vendisphere.com', 'password123')}
              >
                ⏳ Pending Vendor
              </button>
              <button 
                type="button" 
                className="btn-secondary btn-sm"
                onClick={() => handleDemoFill('admin@vendisphere.com', 'admin123')}
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          <div className="auth-footer">
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: '#4f46e5', fontWeight: 700 }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
