import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState('customer')
  const [businessName, setBusinessName] = useState('')
  const [description, setDescription] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const newUser = await register({
        name,
        email,
        password,
        role,
        businessName: role === 'vendor' ? businessName : undefined,
        description: role === 'vendor' ? description : undefined
      })

      if (newUser.role === 'vendor') {
        alert('Vendor storefront created! Your application has been submitted for platform administrator review.')
        navigate('/vendor/dashboard')
      } else {
        navigate('/marketplace')
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
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
              JOIN THE PLATFORM
            </span>
            <h2 className="auth-side-headline">
              {role === 'customer' 
                ? 'Join thousands of shoppers discovering verified stores.' 
                : 'Turn your products into a profitable online store.'}
            </h2>
            <p className="auth-side-subtext">
              {role === 'customer'
                ? 'Create a unified customer profile to shop from multiple independent vendors with unified checkout, fast shipping, and AI guidance.'
                : 'Open your storefront on VendiSphere. Track sales velocity, prevent stockouts, and leverage AI business insights.'}
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>{role === 'customer' ? 'Save addresses and track orders' : 'Direct merchant payouts & low commission'}</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>{role === 'customer' ? 'Write verified buyer reviews' : 'Real-time stock velocity & reorder formulas'}</span>
              </div>
              <div className="auth-feature-item">
                <span className="auth-feature-icon">✓</span>
                <span>{role === 'customer' ? 'AI shopping recommendations' : 'Admin verified trust badge for your store'}</span>
              </div>
            </div>
          </div>

          <div className="auth-side-footer-note">
            © 2026 VendiSphere Platform. Free to register.
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="auth-form-panel">
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', margin: '0 0 6px 0' }}>
              Create an account
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.92rem', margin: 0 }}>
              Select your account type to get started on VendiSphere.
            </p>
          </div>

          {/* Account Role Tabs */}
          <div className="auth-role-tabs">
            <button
              type="button"
              className={`auth-role-tab ${role === 'customer' ? 'active' : ''}`}
              onClick={() => { setRole('customer'); setError('') }}
            >
              <span>🛍️</span>
              <span>Shopper Account</span>
            </button>
            <button
              type="button"
              className={`auth-role-tab ${role === 'vendor' ? 'active' : ''}`}
              onClick={() => { setRole('vendor'); setError('') }}
            >
              <span>🏪</span>
              <span>Vendor Storefront</span>
            </button>
          </div>

          {error && (
            <div className="error-message" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <span>{error}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="fullName">Full Name</label>
              <input 
                id="fullName" 
                type="text" 
                className="form-input" 
                placeholder="Jane Doe" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="registerEmail">Email Address</label>
              <input 
                id="registerEmail" 
                type="email" 
                className="form-input" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                autoComplete="email"
              />
            </div>

            {role === 'vendor' && (
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase' }}>
                  🏪 Storefront Profile Details
                </span>
                <div className="form-group">
                  <label className="form-label" htmlFor="businessName">Store / Business Brand Name *</label>
                  <input 
                    id="businessName" 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Apex Innovations & Audio" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    required={role === 'vendor'}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Store Description</label>
                  <input 
                    id="description" 
                    type="text" 
                    className="form-input" 
                    placeholder="Briefly describe products you sell (e.g. Premium wireless audio & accessories)..." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label" htmlFor="registerPassword">Password</label>
                <div className="password-input-wrapper">
                  <input 
                    id="registerPassword" 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input 
                    id="confirmPassword" 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-input" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required 
                    autoComplete="new-password"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-btn btn-lg" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }}></span>
                  Creating Account...
                </span>
              ) : role === 'vendor' ? 'Register Vendor Storefront →' : 'Complete Customer Registration →'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#4f46e5', fontWeight: 700 }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
