import { Link } from 'react-router-dom'
import {
  TrendingUp, Users, DollarSign, Clock,
  Radio, ArrowUpRight, Eye, Heart
} from 'lucide-react'
import './Dashboard.css'

function Dashboard() {
  const stats = [
    { icon: Users, label: 'Total Followers', value: '12,847', change: '+12%' },
    { icon: Eye, label: 'Views This Month', value: '284,392', change: '+8%' },
    { icon: DollarSign, label: 'Revenue', value: '$4,582', change: '+23%' },
    { icon: Clock, label: 'Stream Hours', value: '142h', change: '+5%' },
  ]

  const recentStreams = [
    { title: 'Friday Night Mix', viewers: 1247, duration: '3h 24m', earnings: '$342' },
    { title: 'Chill Vibes Session', viewers: 892, duration: '2h 15m', earnings: '$186' },
    { title: 'Weekend Party Stream', viewers: 2103, duration: '4h 02m', earnings: '$527' },
  ]

  const topSupporters = [
    { name: 'CoolUser123', amount: '$520', avatar: 'CU' },
    { name: 'MusicLover99', amount: '$385', avatar: 'ML' },
    { name: 'StreamFan42', amount: '$290', avatar: 'SF' },
    { name: 'NightOwl77', amount: '$245', avatar: 'NO' },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, DJ Creator</h1>
          <p>Here's what's happening with your streams</p>
        </div>
        <Link to="/stream" className="btn btn-primary">
          <Radio size={20} />
          Go Live
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card card">
            <div className="stat-icon">
              <stat.icon size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">{stat.label}</span>
              <span className="stat-value">{stat.value}</span>
            </div>
            <span className="stat-change positive">{stat.change}</span>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card recent-streams">
          <div className="card-header">
            <h3>Recent Streams</h3>
            <a href="#" className="view-all">View All <ArrowUpRight size={16} /></a>
          </div>
          <div className="streams-list">
            {recentStreams.map((stream, index) => (
              <div key={index} className="stream-item">
                <div className="stream-thumbnail">
                  <div className="thumbnail-placeholder"></div>
                </div>
                <div className="stream-info">
                  <h4>{stream.title}</h4>
                  <div className="stream-meta">
                    <span><Eye size={14} /> {stream.viewers}</span>
                    <span><Clock size={14} /> {stream.duration}</span>
                  </div>
                </div>
                <div className="stream-earnings">{stream.earnings}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card top-supporters">
          <div className="card-header">
            <h3>Top Supporters</h3>
            <a href="#" className="view-all">View All <ArrowUpRight size={16} /></a>
          </div>
          <div className="supporters-list">
            {topSupporters.map((supporter, index) => (
              <div key={index} className="supporter-item">
                <div className="supporter-rank">#{index + 1}</div>
                <div className="supporter-avatar">{supporter.avatar}</div>
                <div className="supporter-info">
                  <span className="supporter-name">{supporter.name}</span>
                  <span className="supporter-amount">{supporter.amount}</span>
                </div>
                <Heart size={16} className="heart-icon" />
              </div>
            ))}
          </div>
        </div>

        <div className="card analytics-preview">
          <div className="card-header">
            <h3>Viewer Analytics</h3>
            <select className="time-select">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="chart-placeholder">
            <TrendingUp size={48} />
            <p>Analytics visualization would go here</p>
            <div className="chart-bars">
              <div className="bar" style={{ height: '40%' }}></div>
              <div className="bar" style={{ height: '60%' }}></div>
              <div className="bar" style={{ height: '45%' }}></div>
              <div className="bar" style={{ height: '80%' }}></div>
              <div className="bar" style={{ height: '65%' }}></div>
              <div className="bar" style={{ height: '90%' }}></div>
              <div className="bar" style={{ height: '75%' }}></div>
            </div>
          </div>
        </div>

        <div className="card quick-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <Link to="/stream" className="action-btn">
              <Radio size={24} />
              <span>Start Stream</span>
            </Link>
            <Link to="/integrations" className="action-btn">
              <span className="action-icon">DJ</span>
              <span>Serato Sync</span>
            </Link>
            <Link to="/integrations" className="action-btn">
              <span className="action-icon">LV</span>
              <span>Lovense</span>
            </Link>
            <Link to="/pricing" className="action-btn">
              <DollarSign size={24} />
              <span>Withdraw</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
