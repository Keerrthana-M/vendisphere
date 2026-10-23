import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="profile-container animate-fade-up">
      <h1 className="page-title">User Profile</h1>

      <div className="profile-card">
        <div className="profile-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
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
            <span className="user-badge">{user?.role}</span>
          </div>

          <div className="profile-field">
            <span className="profile-label">Member Since</span>
            <span className="profile-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <Link to="/orders" className="btn-primary">
            View My Orders
          </Link>
          <Link to="/marketplace" className="btn-secondary">
            Browse Marketplace
          </Link>
        </div>
      </div>
    </div>
  )
}
