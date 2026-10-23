import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="home-container">
      {/* 1. Hero Section */}
      <section className="hero-section">
        {/* Left Column: Copy & CTAs */}
        <div className="hero-text">
          <span className="hero-eyebrow animate-fade-up delay-1">
            SMART MULTI-VENDOR COMMERCE
          </span>
          <h1 className="hero-title animate-fade-up delay-2">
            Shop Smarter.<br />
            <span>Sell Better.</span>
          </h1>
          <p className="hero-description animate-fade-up delay-3">
            One intelligent marketplace connecting customers, vendors and business insights in a seamless shopping experience.
          </p>
          <div className="hero-buttons animate-fade-up delay-4">
            <Link to="/marketplace" className="btn-primary">
              Explore Marketplace
            </Link>
            <Link to="/register" className="btn-secondary">
              Become a Vendor
            </Link>
          </div>
        </div>

        {/* Right Column: Premium Product Composition Showcase */}
        <div className="hero-visual animate-fade-up delay-5">
          <div className="product-composition">
            {/* Ambient Radial Glow */}
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
                <span className="card-category">Wearables</span>
              </div>
            </div>

            {/* Main Central Product Card: Acoustic Headphones */}
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
                <span className="card-badge">Featured Product</span>
                <h3 className="main-card-title">Acoustic Pro Wireless</h3>
                <span className="card-category">Audio Electronics</span>
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
                <span className="card-category">Footwear</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Feature Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-subtitle">PLATFORM CAPABILITIES</span>
          <h2 className="section-title">Everything You Need to Sell Smarter</h2>
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
            <h3 className="feature-title">Multi-Vendor Marketplace</h3>
            <p className="feature-desc">
              Seamless seller onboarding, independent storefront management, and unified product search.
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
            <h3 className="feature-title">Smart Inventory</h3>
            <p className="feature-desc">
              Automated inventory tracking, real-time stock sync, and intelligent order processing.
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
            <h3 className="feature-title">Vendor Analytics</h3>
            <p className="feature-desc">
              Actionable performance metrics, revenue forecasting, and customer trend discovery.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
              </svg>
            </div>
            <h3 className="feature-title">AI-Powered Insights</h3>
            <p className="feature-desc">
              Smart pricing suggestions, personalized product recommendations, and automated growth tips.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
