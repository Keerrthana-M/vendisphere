import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
  }

  return (
    <div className="auth-page animate-fade-up">
      <div className="auth-card">
        <div className="auth-header">
          <div className="brand-icon">V</div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to your VendiSphere account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              id="email" 
              type="email" 
              className="form-input" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="demo-accounts-box">
          <p className="demo-title">⚡ Quick Demo Autofill (For Project Reviews):</p>
          <div className="demo-buttons">
            <button 
              type="button" 
              className="btn-secondary btn-sm"
              onClick={() => handleDemoFill('customer@vendisphere.com', 'password123')}
            >
              Customer Demo
            </button>
            <button 
              type="button" 
              className="btn-secondary btn-sm"
              onClick={() => handleDemoFill('techvendor@vendisphere.com', 'password123')}
            >
              Approved Vendor Demo
            </button>
            <button 
              type="button" 
              className="btn-secondary btn-sm"
              onClick={() => handleDemoFill('pendingvendor@vendisphere.com', 'password123')}
            >
              Pending Vendor Demo
            </button>
            <button 
              type="button" 
              className="btn-secondary btn-sm"
              onClick={() => handleDemoFill('admin@vendisphere.com', 'admin123')}
            >
              Admin Demo
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  )
}

export default Login
