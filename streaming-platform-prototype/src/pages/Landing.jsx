import { Link } from 'react-router-dom'
import { Play, Zap, Shield, Music, Smartphone, CreditCard } from 'lucide-react'
import './Landing.css'

function Landing() {
  const features = [
    {
      icon: Play,
      title: 'Live Streaming',
      description: 'Broadcast in HD with ultra-low latency WebSocket technology'
    },
    {
      icon: Music,
      title: 'Serato Integration',
      description: 'Sync your DJ software for real-time track info and controls'
    },
    {
      icon: Smartphone,
      title: 'Device Control',
      description: 'Connect and control Lovense devices with audience interaction'
    },
    {
      icon: CreditCard,
      title: 'Monetization',
      description: 'Built-in Stripe subscriptions, tips, and pay-per-view events'
    },
    {
      icon: Zap,
      title: 'Real-time Chat',
      description: 'WebSocket-powered chat with moderation and custom emotes'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'End-to-end encryption and granular privacy controls'
    }
  ]

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="container">
          <div className="nav-brand">
            <span className="brand-icon">S</span>
            <span className="brand-text">StreamSync</span>
          </div>
          <nav className="landing-nav">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <Link to="/dashboard" className="btn btn-secondary">Log In</Link>
            <Link to="/dashboard" className="btn btn-primary">Start Free</Link>
          </nav>
        </div>
      </header>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">Next-Gen Streaming Platform</div>
            <h1>
              Stream. Connect. <span className="gradient-text">Monetize.</span>
            </h1>
            <p>
              The all-in-one platform for creators who want to stream with device
              integration, DJ software sync, and built-in monetization.
            </p>
            <div className="hero-actions">
              <Link to="/dashboard" className="btn btn-primary">
                <Play size={20} />
                Start Streaming
              </Link>
              <a href="#features" className="btn btn-secondary">
                Learn More
              </a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">10K+</span>
                <span className="stat-label">Creators</span>
              </div>
              <div className="stat">
                <span className="stat-value">1M+</span>
                <span className="stat-label">Viewers</span>
              </div>
              <div className="stat">
                <span className="stat-value">$5M+</span>
                <span className="stat-label">Paid Out</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="mockup-window animate-float">
              <div className="mockup-header">
                <div className="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
              </div>
              <div className="mockup-content">
                <div className="mockup-video">
                  <div className="live-badge">LIVE</div>
                  <div className="viewer-count">1,234 viewers</div>
                </div>
                <div className="mockup-chat">
                  <div className="chat-message"><span>User1:</span> Amazing stream!</div>
                  <div className="chat-message"><span>User2:</span> Love the music!</div>
                  <div className="chat-message tip"><span>User3 tipped $10</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="features">
        <div className="container">
          <div className="section-header">
            <h2>Everything You Need to <span className="gradient-text">Succeed</span></h2>
            <p>Powerful features designed for modern creators</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card card">
                <div className="feature-icon">
                  <feature.icon size={24} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Streaming?</h2>
            <p>Join thousands of creators already using StreamSync</p>
            <Link to="/dashboard" className="btn btn-primary">
              Get Started Free
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2024 StreamSync. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default Landing
