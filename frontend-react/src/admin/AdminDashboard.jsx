import { useState } from 'react';
import '../styles/admin.css';

const sidebarItems = [
  { label: 'Overview', icon: '📊' },
  { label: 'Applications', icon: '📩' },
  { label: 'Incentives', icon: '💰' },
  { label: 'Partners', icon: '🤝' },
  { label: 'Settings', icon: '⚙️' },
  { label: 'Activity', icon: '📈' },
];

export default function AdminDashboard() {
  const [active, setActive] = useState(0);
  return (
    <div className="dashboard-root">
      <header className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>POWAHA Control Panel</p>
        </div>
        <button className="logout-btn">Logout</button>
      </header>
      <div className="dashboard-main">
        <aside className="dashboard-sidebar">
          {sidebarItems.map((item, idx) => (
            <div
              key={item.label}
              className={active === idx ? 'sidebar-item active' : 'sidebar-item'}
              onClick={() => setActive(idx)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </aside>
        <main className="dashboard-content">
          {active === 0 && (
            <>
              <div className="stats-row">
                <div className="stat-card highlight">
                  <div className="stat-icon">📩</div>
                  <div className="stat-label">PENDING APPLICATIONS</div>
                  <div className="stat-value">1</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-label">ACTIVE CPS</div>
                  <div className="stat-value">7</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-label">PENDING INCENTIVES</div>
                  <div className="stat-value">0</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🏢</div>
                  <div className="stat-label">TOTAL CPS</div>
                  <div className="stat-value">9</div>
                </div>
              </div>
              <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="actions-grid">
                  <div className="action-card">
                    <div className="action-icon">📋</div>
                    <div className="action-title">Review Applications</div>
                    <div className="action-desc">Pending CP approvals</div>
                  </div>
                  <div className="action-card">
                    <div className="action-icon">💸</div>
                    <div className="action-title">Approve Incentives</div>
                    <div className="action-desc">Pending payouts</div>
                  </div>
                  <div className="action-card">
                    <div className="action-icon">🤝</div>
                    <div className="action-title">Manage Partners</div>
                    <div className="action-desc">Active CPs</div>
                  </div>
                  <div className="action-card">
                    <div className="action-icon">⚙️</div>
                    <div className="action-title">Configuration</div>
                    <div className="action-desc">System settings</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
