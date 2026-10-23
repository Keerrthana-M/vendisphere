import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

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
  const [heroSearch, setHeroSearch] = useState('')
  const navigate = useNavigate()

  const handleHeroSearch = (e) => {
    e.preventDefault()
    if (heroSearch.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(heroSearch.trim())}`)
    } else {
      navigate('/marketplace')
    }
  }

  return (
    <div className="home-container">
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

          {/* Quick Hero Search Input */}
          <form onSubmit={handleHeroSearch} className="hero-search-box animate-fade-up" style={{ width: '100%', maxWidth: '480px', display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search products, brands, or categories..."
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem', background: '#ffffff', borderRadius: '12px' }}
              />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>
            <button type="submit" className="btn-primary" style={{ whiteSpace: 'nowrap', borderRadius: '12px' }}>
              Search
            </button>
          </form>

          <div className="hero-buttons animate-fade-up">
            <Link to="/marketplace" className="btn-primary btn-lg">
              Explore Marketplace →
            </Link>
            <Link to="/register" className="btn-secondary btn-lg">
              Become a Vendor
            </Link>
          </div>
        </div>

        {/* Right Column: Visual Composition Showcase */}
        <div className="hero-visual animate-fade-up">
          <div className="product-composition">
            <div className="composition-glow"></div>

            {/* Overlapping Card 1: Top Right Smartwatch */}
            <div className="composition-card card-top-right">
              <div className="card-illustration watch-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="6"></circle>
                  <polyline points="12 9 12 12 13.5 13.5"></polyline>
                  <path d="M12 6V3M12 21v-3"></path>
                </svg>
              </div>
              <div className="card-meta">
                <span className="card-title">Horizon Smartwatch</span>
                <span className="card-category">Verified Vendor • In Stock</span>
              </div>
            </div>

            {/* Main Central Product Card */}
            <div className="composition-card card-center">
              <div className="card-illustration main-product-bg">
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 14v3a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-3"></path>
                  <path d="M3 14h3a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H3v7z"></path>
                  <path d="M21 14h-3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3v7z"></path>
                  <path d="M5 7a7 7 0 0 1 14 0"></path>
                </svg>
              </div>
              <div className="center-meta">
                <span className="card-badge">⭐ Trending Choice</span>
                <h3 className="main-card-title">Acoustic Pro Wireless</h3>
                <span className="card-category" style={{ color: '#4f46e5', fontWeight: 700 }}>₹7,999</span>
                <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>✓ Free Delivery Across India</span>
              </div>
            </div>

            {/* Overlapping Card 2: Bottom Left Sneakers */}
            <div className="composition-card card-bottom-left">
              <div className="card-illustration sneaker-bg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.38 3.46L16 2a4 4 0 0 0-3.8 1.48L9 7M20.38 3.46A2 2 0 0 1 22 5.37V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4.5a2 2 0 0 1 1.25-1.87l6.65-2.66M20.38 3.46L13.72 10"></path>
                </svg>
              </div>
              <div className="card-meta">
                <span className="card-title">Urban Flex Runner</span>
                <span className="card-category">Footwear • 4.8 Rating</span>
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
    </div>
  )
}
