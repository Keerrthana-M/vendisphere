import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
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
      setError('Passwords do not match')
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
        alert('Vendor account registered! Admin approval is required before you can list products.')
        navigate('/vendor/dashboard')
      } else {
        navigate('/marketplace')
      }
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page animate-fade-up">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon">V</div>
          <h2 className="auth-title">Create Your Account</h2>
          <p className="auth-subtitle">Join VendiSphere as a customer or vendor</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">I want to join as a:</label>
            <div className="role-selector-toggle">
              <button
                type="button"
                className={`toggle-btn ${role === 'customer' ? 'active' : ''}`}
                onClick={() => setRole('customer')}
              >
                🛍️ Customer
              </button>
              <button
                type="button"
                className={`toggle-btn ${role === 'vendor' ? 'active' : ''}`}
                onClick={() => setRole('vendor')}
              >
                🏪 Vendor Storefront
              </button>
            </div>
          </div>

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
            />
          </div>

          {role === 'vendor' && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="businessName">Store / Business Name</label>
                <input 
                  id="businessName" 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Acme Innovations" 
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
                  placeholder="Brief summary of products you sell..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-row-2">
            <div className="form-group">
              <label className="form-label" htmlFor="registerPassword">Password</label>
              <input 
                id="registerPassword" 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input 
                id="confirmPassword" 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Registering...' : role === 'vendor' ? 'Register Storefront' : 'Create Customer Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
