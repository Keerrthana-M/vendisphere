import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { apiRequest } from '../services/api'
import QuickViewModal from '../components/common/QuickViewModal'

const HERO_FEATURED = {
  center: {
    _id: '6adb4e9b3176a8b6d0314e39',
    name: 'Wireless Noise-Cancelling Headphones',
    category: 'Electronics',
    price: 8999,
    rating: 4.9,
    stock: 18,
    vendorBusinessName: 'TechHub Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    description: 'Premium over-ear acoustic headphones with active noise cancellation, 40-hour battery life, and crystal-clear microphone audio.'
  },
  watch: {
    _id: '6adb4e9b3176a8b6d0314e3a',
    name: 'Horizon Smartwatch Pro',
    category: 'Electronics',
    price: 14999,
    rating: 4.8,
    stock: 25,
    vendorBusinessName: 'TechHub Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    description: 'Flagship AMOLED display smartwatch featuring continuous heart rate tracking, SpO2 sensor, GPS, and 7-day battery life.'
  },
  sneaker: {
    _id: '6adb4e9b3176a8b6d0314e3b',
    name: 'Urban Flex Running Shoes',
    category: 'Fashion',
    price: 5499,
    rating: 4.7,
    stock: 12,
    vendorBusinessName: 'Style & Apparel Co',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
    description: 'Lightweight, breathable athletic running shoes engineered with high-rebound cushioning for daily training and running.'
  }
}

const CATEGORIES = [
  {
    name: 'Electronics',
    desc: 'Audio, gadgets & wearables',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    )
  },
  {
    name: 'Fashion',
    desc: 'Apparel, footwear & styles',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.38 3.46L16 2a4 4 0 0 0-3.8 1.48L9 7M20.38 3.46A2 2 0 0 1 22 5.37V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4.5a2 2 0 0 1 1.25-1.87l6.65-2.66M20.38 3.46L13.72 10"></path>
      </svg>
    )
  },
  {
    name: 'Grocery',
    desc: 'Organic pantry & staples',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </svg>
    )
  },
  {
    name: 'Accessories',
    desc: 'Watches, jewelry & belts',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="7"></circle>
        <polyline points="12 9 12 12 13.5 13.5"></polyline>
        <path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83"></path>
      </svg>
    )
  },
  {
    name: 'Home & Kitchen',
    desc: 'Cookware & smart living',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    )
  },
  {
    name: 'Books',
    desc: 'Bestsellers & literature',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    )
  },
  {
    name: 'Sports & Fitness',
    desc: 'Activewear & gym gear',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
        <path d="M2 12h20"></path>
      </svg>
    )
  },
  {
    name: 'Beauty & Personal Care',
    desc: 'Skincare & wellness',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
      </svg>
    )
  }
]

export default function Home() {
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [cartToast, setCartToast] = useState('')

  const { isAuthenticated, user, refreshCartCount } = useAuth()
  const navigate = useNavigate()

  const handleAddToCart = async (productId, productName, quantity = 1) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    if (user?.role !== 'customer') {
      alert('Only customer accounts can add items to cart.')
      return
    }

    try {
      await apiRequest('/cart', 'POST', { productId, quantity })
      setCartToast(`✓ Added ${quantity > 1 ? `${quantity} items of ` : ''}"${productName || 'Item'}" to your cart!`)
      if (refreshCartCount) refreshCartCount()
      setTimeout(() => setCartToast(''), 3500)
    } catch (err) {
      alert(err.message || 'Failed to add item to cart')
    }
  }

  return (
    <div className="home-container">
      {cartToast && (
        <div className="toast-success" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <span>{cartToast}</span>
          <Link to="/cart" style={{ color: '#047857', fontWeight: 700, textDecoration: 'underline', fontSize: '0.9rem' }}>
            View Cart →
          </Link>
        </div>
      )}

      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <span className="hero-eyebrow animate-fade-up">
            ✨ NEXT-GEN MULTI-VENDOR PLATFORM
          </span>
          <h1 className="hero-title animate-fade-up">
            Shop Smarter.<br />
            <span>Scale Faster.</span>
          </h1>
          <p className="hero-description animate-fade-up">
            One intelligent marketplace connecting verified independent vendors with shoppers across India. Powered by real-time inventory intelligence and AI assistance.
          </p>

          {/* Trust Value Micro-Strip */}
          <div className="hero-trust-strip animate-fade-up" style={{ marginTop: '0.5rem' }}>
            <div className="hero-trust-item">
              <span>🛡️</span>
              <span>100% Genuine</span>
            </div>
            <div className="hero-trust-item">
              <span>✓</span>
              <span>Verified Sellers</span>
            </div>
            <div className="hero-trust-item">
              <span>🚚</span>
              <span>Free Delivery</span>
            </div>
            <div className="hero-trust-item">
              <span>🤖</span>
              <span>AI Assisted</span>
            </div>
          </div>

          <div className="hero-buttons animate-fade-up" style={{ marginTop: '1.25rem' }}>
            <Link to="/marketplace" className="btn-primary btn-lg">
              Explore Marketplace →
            </Link>
            <Link to="/register" className="btn-secondary btn-lg">
              Become a Vendor
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Composition Showcase with Real Photography */}
        <div className="hero-visual animate-fade-up">
          <div className="product-composition">
            <div className="composition-glow"></div>

            {/* Overlapping Card 1: Top Right Smartwatch */}
            <div 
              className="composition-card card-top-right"
              onClick={() => setQuickViewProduct(HERO_FEATURED.watch)}
              style={{ cursor: 'pointer' }}
              title="Click to preview Horizon Smartwatch Pro"
            >
              <img 
                src={HERO_FEATURED.watch.imageUrl} 
                alt="Horizon Smartwatch" 
                className="hero-thumb-img"
              />
              <div className="card-meta">
                <span className="card-title">{HERO_FEATURED.watch.name}</span>
                <span className="card-category" style={{ color: '#4f46e5', fontWeight: 700 }}>
                  ₹14,999 • ⭐ {HERO_FEATURED.watch.rating}
                </span>
              </div>
            </div>

            {/* Main Central Product Card */}
            <div className="composition-card card-center">
              <div className="hero-center-img-box">
                <img 
                  src={HERO_FEATURED.center.imageUrl} 
                  alt="Acoustic Wireless Headphones" 
                  className="hero-center-img"
                />
              </div>
              <div className="center-meta">
                <span className="card-badge">⭐ Trending Choice</span>
                <h3 className="main-card-title">{HERO_FEATURED.center.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                  <span style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>₹8,999</span>
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', textDecoration: 'line-through' }}>₹11,999</span>
                  <span style={{ fontSize: '0.72rem', color: '#16a34a', fontWeight: 700, background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>25% OFF</span>
                </div>
                <span style={{ fontSize: '0.76rem', color: '#10b981', fontWeight: 600, marginTop: '2px' }}>✓ Free Delivery Across India</span>

                <button 
                  type="button" 
                  className="btn-primary btn-sm"
                  style={{ width: '100%', marginTop: '8px', height: '36px', borderRadius: '10px' }}
                  onClick={() => setQuickViewProduct(HERO_FEATURED.center)}
                >
                  👁️ Quick Preview
                </button>
              </div>
            </div>

            {/* Overlapping Card 2: Bottom Left Sneakers */}
            <div 
              className="composition-card card-bottom-left"
              onClick={() => setQuickViewProduct(HERO_FEATURED.sneaker)}
              style={{ cursor: 'pointer' }}
              title="Click to preview Urban Flex Running Shoes"
            >
              <img 
                src={HERO_FEATURED.sneaker.imageUrl} 
                alt="Urban Flex Running Shoes" 
                className="hero-thumb-img"
              />
              <div className="card-meta">
                <span className="card-title">{HERO_FEATURED.sneaker.name}</span>
                <span className="card-category" style={{ color: '#4f46e5', fontWeight: 700 }}>
                  ₹5,499 • ⭐ {HERO_FEATURED.sneaker.rating}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Platform Stats Ticker */}
      <section className="stats-ticker-strip">
        <div className="ticker-item">
          <span className="ticker-num">₹14.8M+</span>
          <span className="ticker-label">Platform GMV</span>
        </div>
        <div className="ticker-item">
          <span className="ticker-num">150+</span>
          <span className="ticker-label">Verified Stores</span>
        </div>
        <div className="ticker-item">
          <span className="ticker-num">12,000+</span>
          <span className="ticker-label">Products Listed</span>
        </div>
        <div className="ticker-item">
          <span className="ticker-num">99.4%</span>
          <span className="ticker-label">Fulfillment Rate</span>
        </div>
      </section>

      {/* 3. Category Navigation Section */}
      <section className="categories-browse-section">
        <div className="section-header" style={{ marginBottom: '2rem' }}>
          <span className="section-subtitle">CURATED COMMERCE</span>
          <h2 className="section-title">Explore by Category</h2>
          <p style={{ color: '#64748b', fontSize: '0.98rem' }}>Browse top-tier products supplied by authentic independent merchants.</p>
        </div>

        <div className="category-cards-grid">
          {CATEGORIES.map(cat => (
            <Link 
              key={cat.name} 
              to={`/marketplace?category=${encodeURIComponent(cat.name)}`}
              className="category-card"
            >
              <div className="category-card-icon">
                {cat.icon}
              </div>
              <span className="category-card-name">{cat.name}</span>
              <span className="category-card-count">{cat.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Features Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-subtitle">PLATFORM ARCHITECTURE</span>
          <h2 className="section-title">Engineered for Sellers & Shoppers</h2>
          <p style={{ color: '#64748b', fontSize: '0.98rem' }}>Everything required to operate an agile multi-vendor ecosystem with modern confidence.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </div>
            <h3 className="feature-title">Independent Storefronts</h3>
            <p className="feature-desc">
              Sellers manage their own catalog, fulfillment workflows, and pricing policies under a unified customer checkout.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 className="feature-title">Smart Velocity Inventory</h3>
            <p className="feature-desc">
              Automated 14-day sales velocity formulas predict stockouts and recommend optimal restock quantities.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
            <h3 className="feature-title">Business Intelligence</h3>
            <p className="feature-desc">
              Actionable vendor metrics, real-time revenue analytics, and top product rankings without guesswork.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
            </div>
            <h3 className="feature-title">AI Shopping Assistant</h3>
            <p className="feature-desc">
              Natural language queries guide customers to the right product with price boundaries and category matching.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Vendor Partner Value Prop Banner */}
      <section className="vendor-cta-banner">
        <div className="vendor-cta-content">
          <span className="vendor-cta-eyebrow">SELLER OPPORTUNITY</span>
          <h2 className="vendor-cta-title">Scale Your Business on VendiSphere</h2>
          <p className="vendor-cta-desc">
            Reach thousands of shoppers, protect your stock with intelligent reorder formulas, and accept orders with zero setup complexity.
          </p>

          <div className="vendor-cta-perks">
            <div className="vendor-perk-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Instant Seller Onboarding</span>
            </div>
            <div className="vendor-perk-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Automated Stockout Alerts</span>
            </div>
            <div className="vendor-perk-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>AI Pricing & Growth Tips</span>
            </div>
            <div className="vendor-perk-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Admin Verified Trust</span>
            </div>
          </div>

          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn-primary btn-lg">
              Open Your Storefront Today →
            </Link>
            <Link to="/marketplace" className="btn-secondary btn-lg">
              Browse Active Stores
            </Link>
          </div>
        </div>

        <div className="vendor-cta-visual">
          <div className="vendor-mock-card">
            <div className="mock-card-header">
              <span className="mock-store-name">Apex Electronics Store</span>
              <span className="status-badge status-approved">Approved</span>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>MONTHLY GROSS REVENUE</span>
              <div className="mock-sales-num">₹2,48,500</div>
            </div>
            <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.84rem', color: '#334155' }}>
              💡 <strong>AI Prediction:</strong> Restock 14 units of Noise-Cancelling Headphones before Friday.
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Interactive Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onAddToCart={(productId, productName, qty) => handleAddToCart(productId, productName, qty)}
        />
      )}
    </div>
  )
}
