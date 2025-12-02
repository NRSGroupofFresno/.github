import { Outlet, NavLink } from 'react-router-dom'
import { Home, Radio, CreditCard, Settings, Menu, X, Bell, User } from 'lucide-react'
import { useState } from 'react'
import './Layout.css'

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/stream', icon: Radio, label: 'Go Live' },
    { path: '/pricing', icon: CreditCard, label: 'Subscription' },
    { path: '/integrations', icon: Settings, label: 'Integrations' },
  ]

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">S</span>
            {sidebarOpen && <span className="logo-text">StreamSync</span>}
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">DJ</div>
            {sidebarOpen && (
              <div className="user-info">
                <span className="user-name">DJ Creator</span>
                <span className="user-status">Pro Plan</span>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="main-wrapper">
        <header className="topbar">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="topbar-actions">
            <button className="icon-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
            <button className="icon-btn">
              <User size={20} />
            </button>
          </div>
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
