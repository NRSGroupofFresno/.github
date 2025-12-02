import { useState } from 'react'
import {
  Music, Smartphone, CreditCard, Link2, Unlink,
  Settings, RefreshCw, AlertCircle, CheckCircle,
  Sliders, Vibrate, Volume2
} from 'lucide-react'
import './Integrations.css'

function Integrations() {
  const [seratoConnected, setSeratoConnected] = useState(true)
  const [lovenseConnected, setLovenseConnected] = useState(true)
  const [stripeConnected, setStripeConnected] = useState(true)

  const lovenseDevices = [
    { name: 'Lush 3', status: 'connected', battery: 85 },
    { name: 'Max 2', status: 'connected', battery: 62 },
  ]

  const seratoInfo = {
    version: '3.0.1',
    library: '2,847 tracks',
    lastSync: '2 minutes ago'
  }

  const tipReactions = [
    { amount: '$1-4', action: 'Low vibration (3s)' },
    { amount: '$5-9', action: 'Medium vibration (5s)' },
    { amount: '$10-24', action: 'High vibration (10s)' },
    { amount: '$25-49', action: 'Pattern: Wave (15s)' },
    { amount: '$50+', action: 'Max intensity (30s)' },
  ]

  return (
    <div className="integrations-page">
      <div className="integrations-header">
        <h1>Integrations</h1>
        <p>Connect your tools and devices for an enhanced streaming experience</p>
      </div>

      <div className="integrations-grid">
        {/* Serato Integration */}
        <div className="integration-card card">
          <div className="integration-header">
            <div className="integration-icon serato">
              <Music size={24} />
            </div>
            <div className="integration-title">
              <h3>Serato DJ</h3>
              <span className={`status ${seratoConnected ? 'connected' : ''}`}>
                {seratoConnected ? (
                  <><CheckCircle size={14} /> Connected</>
                ) : (
                  <><AlertCircle size={14} /> Disconnected</>
                )}
              </span>
            </div>
            <button
              className={`toggle-btn ${seratoConnected ? 'connected' : ''}`}
              onClick={() => setSeratoConnected(!seratoConnected)}
            >
              {seratoConnected ? <Unlink size={18} /> : <Link2 size={18} />}
            </button>
          </div>

          {seratoConnected && (
            <div className="integration-content">
              <div className="integration-stats">
                <div className="stat-item">
                  <span className="stat-label">Version</span>
                  <span className="stat-value">{seratoInfo.version}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Library</span>
                  <span className="stat-value">{seratoInfo.library}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Last Sync</span>
                  <span className="stat-value">{seratoInfo.lastSync}</span>
                </div>
              </div>

              <div className="integration-features">
                <h4>Features</h4>
                <label className="feature-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                  Show current track on stream
                </label>
                <label className="feature-toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider"></span>
                  Display BPM overlay
                </label>
                <label className="feature-toggle">
                  <input type="checkbox" />
                  <span className="toggle-slider"></span>
                  Track history in chat
                </label>
              </div>

              <button className="btn btn-secondary">
                <RefreshCw size={16} /> Resync Library
              </button>
            </div>
          )}
        </div>

        {/* Lovense Integration */}
        <div className="integration-card card">
          <div className="integration-header">
            <div className="integration-icon lovense">
              <Smartphone size={24} />
            </div>
            <div className="integration-title">
              <h3>Lovense</h3>
              <span className={`status ${lovenseConnected ? 'connected' : ''}`}>
                {lovenseConnected ? (
                  <><CheckCircle size={14} /> {lovenseDevices.length} devices</>
                ) : (
                  <><AlertCircle size={14} /> Disconnected</>
                )}
              </span>
            </div>
            <button
              className={`toggle-btn ${lovenseConnected ? 'connected' : ''}`}
              onClick={() => setLovenseConnected(!lovenseConnected)}
            >
              {lovenseConnected ? <Unlink size={18} /> : <Link2 size={18} />}
            </button>
          </div>

          {lovenseConnected && (
            <div className="integration-content">
              <div className="devices-list">
                <h4>Connected Devices</h4>
                {lovenseDevices.map((device, index) => (
                  <div key={index} className="device-item">
                    <Vibrate size={18} />
                    <div className="device-info">
                      <span className="device-name">{device.name}</span>
                      <span className="device-status">{device.status}</span>
                    </div>
                    <div className="device-battery">
                      <div className="battery-bar">
                        <div
                          className="battery-fill"
                          style={{ width: `${device.battery}%` }}
                        ></div>
                      </div>
                      <span>{device.battery}%</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="tip-reactions">
                <h4>Tip Reactions</h4>
                <p className="tip-description">
                  Configure automatic device responses based on tip amounts
                </p>
                <div className="reactions-list">
                  {tipReactions.map((reaction, index) => (
                    <div key={index} className="reaction-item">
                      <span className="reaction-amount">{reaction.amount}</span>
                      <span className="reaction-action">{reaction.action}</span>
                      <button className="edit-btn">
                        <Sliders size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button className="btn btn-secondary">
                <Settings size={16} /> Advanced Settings
              </button>
            </div>
          )}
        </div>

        {/* Stripe Integration */}
        <div className="integration-card card">
          <div className="integration-header">
            <div className="integration-icon stripe">
              <CreditCard size={24} />
            </div>
            <div className="integration-title">
              <h3>Stripe Payments</h3>
              <span className={`status ${stripeConnected ? 'connected' : ''}`}>
                {stripeConnected ? (
                  <><CheckCircle size={14} /> Active</>
                ) : (
                  <><AlertCircle size={14} /> Not Connected</>
                )}
              </span>
            </div>
            <button
              className={`toggle-btn ${stripeConnected ? 'connected' : ''}`}
              onClick={() => setStripeConnected(!stripeConnected)}
            >
              {stripeConnected ? <Unlink size={18} /> : <Link2 size={18} />}
            </button>
          </div>

          {stripeConnected && (
            <div className="integration-content">
              <div className="stripe-features">
                <div className="stripe-feature">
                  <div className="feature-icon">
                    <CheckCircle size={18} />
                  </div>
                  <div className="feature-info">
                    <span className="feature-name">Tips & Donations</span>
                    <span className="feature-desc">Accept one-time payments</span>
                  </div>
                </div>
                <div className="stripe-feature">
                  <div className="feature-icon">
                    <CheckCircle size={18} />
                  </div>
                  <div className="feature-info">
                    <span className="feature-name">Subscriptions</span>
                    <span className="feature-desc">Recurring monthly payments</span>
                  </div>
                </div>
                <div className="stripe-feature">
                  <div className="feature-icon">
                    <CheckCircle size={18} />
                  </div>
                  <div className="feature-info">
                    <span className="feature-name">Pay-Per-View</span>
                    <span className="feature-desc">Charge for exclusive content</span>
                  </div>
                </div>
              </div>

              <div className="stripe-settings">
                <h4>Payment Settings</h4>
                <div className="setting-item">
                  <span>Minimum tip amount</span>
                  <select defaultValue="1">
                    <option value="1">$1.00</option>
                    <option value="2">$2.00</option>
                    <option value="5">$5.00</option>
                  </select>
                </div>
                <div className="setting-item">
                  <span>Currency</span>
                  <select defaultValue="usd">
                    <option value="usd">USD ($)</option>
                    <option value="eur">EUR (&euro;)</option>
                    <option value="gbp">GBP (&pound;)</option>
                  </select>
                </div>
              </div>

              <button className="btn btn-secondary">
                <Settings size={16} /> Stripe Dashboard
              </button>
            </div>
          )}
        </div>

        {/* OBS/Streaming Software */}
        <div className="integration-card card">
          <div className="integration-header">
            <div className="integration-icon obs">
              <Volume2 size={24} />
            </div>
            <div className="integration-title">
              <h3>OBS Studio</h3>
              <span className="status">
                <AlertCircle size={14} /> Not Connected
              </span>
            </div>
            <button className="toggle-btn">
              <Link2 size={18} />
            </button>
          </div>

          <div className="integration-content">
            <p className="coming-soon">
              OBS WebSocket integration coming soon. Stream directly from OBS
              while keeping all StreamSync features.
            </p>
            <button className="btn btn-secondary" disabled>
              Coming Soon
            </button>
          </div>
        </div>
      </div>

      <div className="api-section card">
        <div className="api-header">
          <div>
            <h3>API Access</h3>
            <p>Build custom integrations with our REST API</p>
          </div>
          <span className="api-badge">Enterprise Plan</span>
        </div>
        <div className="api-key">
          <label>API Key</label>
          <div className="key-input">
            <input type="password" value="sk_live_xxxxxxxxxxxxxxxxxxxx" readOnly />
            <button className="btn btn-secondary">Copy</button>
            <button className="btn btn-secondary">Regenerate</button>
          </div>
        </div>
        <a href="#" className="api-docs-link">View API Documentation &rarr;</a>
      </div>
    </div>
  )
}

export default Integrations
