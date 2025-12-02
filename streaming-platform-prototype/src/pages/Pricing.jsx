import { Check, Zap, Crown, Rocket } from 'lucide-react'
import './Pricing.css'

function Pricing() {
  const plans = [
    {
      name: 'Starter',
      icon: Zap,
      price: 'Free',
      period: '',
      description: 'Perfect for getting started',
      features: [
        '720p streaming quality',
        'Basic chat features',
        'Up to 50 concurrent viewers',
        'Standard support',
        '5% platform fee on tips',
      ],
      current: false,
      cta: 'Current Plan'
    },
    {
      name: 'Pro',
      icon: Crown,
      price: '$19',
      period: '/month',
      description: 'For serious creators',
      features: [
        '1080p HD streaming',
        'Advanced chat moderation',
        'Unlimited viewers',
        'Serato integration',
        'Lovense basic controls',
        '3% platform fee on tips',
        'Priority support',
        'Custom emotes (10)',
      ],
      current: true,
      popular: true,
      cta: 'Current Plan'
    },
    {
      name: 'Enterprise',
      icon: Rocket,
      price: '$49',
      period: '/month',
      description: 'Full professional suite',
      features: [
        '4K streaming quality',
        'All Pro features',
        'Full Lovense integration',
        'Multi-camera support',
        '0% platform fee',
        'Dedicated account manager',
        'Custom branding',
        'API access',
        'Unlimited custom emotes',
      ],
      current: false,
      cta: 'Upgrade'
    }
  ]

  const earnings = {
    thisMonth: 4582,
    pending: 1247,
    lifetime: 28493,
    nextPayout: '2024-01-15'
  }

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Subscription & Earnings</h1>
        <p>Manage your plan and track your revenue</p>
      </div>

      <div className="earnings-overview">
        <div className="earnings-card card">
          <span className="earnings-label">This Month</span>
          <span className="earnings-value">${earnings.thisMonth.toLocaleString()}</span>
        </div>
        <div className="earnings-card card">
          <span className="earnings-label">Pending Payout</span>
          <span className="earnings-value pending">${earnings.pending.toLocaleString()}</span>
        </div>
        <div className="earnings-card card">
          <span className="earnings-label">Lifetime Earnings</span>
          <span className="earnings-value">${earnings.lifetime.toLocaleString()}</span>
        </div>
        <div className="earnings-card card">
          <span className="earnings-label">Next Payout</span>
          <span className="earnings-value date">{earnings.nextPayout}</span>
        </div>
      </div>

      <div className="payout-section card">
        <div className="payout-header">
          <div>
            <h3>Payout Settings</h3>
            <p>Powered by Stripe Connect</p>
          </div>
          <button className="btn btn-secondary">Manage Payouts</button>
        </div>
        <div className="payout-info">
          <div className="payout-item">
            <span className="payout-label">Connected Account</span>
            <span className="payout-value">**** **** **** 4242</span>
          </div>
          <div className="payout-item">
            <span className="payout-label">Payout Schedule</span>
            <span className="payout-value">Weekly (Every Monday)</span>
          </div>
          <div className="payout-item">
            <span className="payout-label">Minimum Payout</span>
            <span className="payout-value">$50.00</span>
          </div>
        </div>
      </div>

      <h2 className="section-title">Choose Your Plan</h2>

      <div className="plans-grid">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={`plan-card card ${plan.popular ? 'popular' : ''} ${plan.current ? 'current' : ''}`}
          >
            {plan.popular && <span className="popular-badge">Most Popular</span>}
            <div className="plan-icon">
              <plan.icon size={24} />
            </div>
            <h3 className="plan-name">{plan.name}</h3>
            <div className="plan-price">
              <span className="price">{plan.price}</span>
              <span className="period">{plan.period}</span>
            </div>
            <p className="plan-description">{plan.description}</p>
            <ul className="plan-features">
              {plan.features.map((feature, i) => (
                <li key={i}>
                  <Check size={16} />
                  {feature}
                </li>
              ))}
            </ul>
            <button
              className={`plan-btn ${plan.current ? 'current' : ''}`}
              disabled={plan.current}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="faq-section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-grid">
          <div className="faq-item card">
            <h4>How do payouts work?</h4>
            <p>Earnings from tips, subscriptions, and pay-per-view are processed through Stripe and paid out on your chosen schedule.</p>
          </div>
          <div className="faq-item card">
            <h4>Can I cancel anytime?</h4>
            <p>Yes, you can downgrade or cancel your subscription at any time. You'll retain access until the end of your billing period.</p>
          </div>
          <div className="faq-item card">
            <h4>What's the platform fee?</h4>
            <p>Platform fees vary by plan: 5% for Starter, 3% for Pro, and 0% for Enterprise. This covers payment processing and platform maintenance.</p>
          </div>
          <div className="faq-item card">
            <h4>Do you support international payouts?</h4>
            <p>Yes! We support payouts to bank accounts in 40+ countries through Stripe's global payment network.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Pricing
