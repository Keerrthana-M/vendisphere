import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="profile-container animate-fade-up">
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>My Account</h1>
        <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>Manage your platform profile and preferences.</p>
      </div>

      <div className="profile-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1.5rem' }}>
          <div className="profile-avatar">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <div>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '1.35rem', fontWeight: 800, color: '#0f172a' }}>
              {user?.name || 'VendiSphere User'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`user-badge badge-${user?.role || 'customer'}`}>
                {user?.role?.toUpperCase()} ACCOUNT
              </span>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                • Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-info-grid">
          <div className="profile-field">
            <span className="profile-label">Full Name</span>
            <span className="profile-value">{user?.name}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Email Address</span>
            <span className="profile-value">{user?.email}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Account Role</span>
            <span className="profile-value" style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </div>

          {user?.role === 'vendor' && (
            <div className="profile-field">
              <span className="profile-label">Storefront Name</span>
              <span className="profile-value">{user?.vendorProfile?.businessName || 'Your Storefront'}</span>
            </div>
          )}
        </div>

        <div className="profile-actions" style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.5rem' }}>
          {user?.role === 'customer' && (
            <Link to="/orders" className="btn-primary">
              View My Orders →
            </Link>
          )}

          {user?.role === 'vendor' && (
            <Link to="/vendor/dashboard" className="btn-primary">
              Go to Vendor Portal →
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="btn-primary">
              Go to Admin Portal →
            </Link>
          )}

          <Link to="/marketplace" className="btn-secondary">
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  )
}
