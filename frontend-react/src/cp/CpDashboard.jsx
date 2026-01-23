import { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/style.css';

const TABS = [
  { key: 'overview', label: '📈 Overview' },
  { key: 'leads', label: '📋 Leads' },
  { key: 'incentives', label: '💰 Incentives' },
  { key: 'profile', label: '👤 Profile' },
  { key: 'documents', label: '📄 Documents' },
];

export default function CpDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    cp: {},
    aoo: [],
    leads: { total: 0, by_stage: {} },
    incentives: { pending: 0, approved: 0 },
  });

  useEffect(() => {
    api.get('/cp/dashboard').then(res => {
      setStats(res.data);
    });
  }, []);

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('lastAppliedEmail');
    window.location.href = '/cp/apply';
  }

  return (
    <div className="dashboard-wrapper">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1>{stats.cp?.name || 'Loading...'}</h1>
            <p className="status-badge">Status: <span>{stats.cp?.status || '-'}</span></p>
          </div>
          <button className="btn-danger" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="dashboard-container">
        {/* Sidebar Navigation */}
        <div className="dashboard-sidebar">
          <nav className="sidebar-nav">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`nav-btn${activeTab === tab.key ? ' active' : ''}`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        {/* Main Content */}
        <div className="dashboard-main">
          {activeTab === 'overview' && (
            <div className="dashboard-tab active">
              {/* Quick Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📍</div>
                  <div className="stat-content">
                    <p className="stat-label">Assigned Area of Operation</p>
                    <p className="stat-value stat-aoo">{stats.aoo.length ? stats.aoo.join(', ') : 'Not assigned'}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-content">
                    <p className="stat-label">Total Leads</p>
                    <p className="stat-value">{stats.leads?.total || 0}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <p className="stat-label">Closed Leads</p>
                    <p className="stat-value">{stats.leads?.by_stage?.CLOSED || 0}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <p className="stat-label">Total Incentives</p>
                    <p className="stat-value">{(stats.incentives?.pending || 0) + (stats.incentives?.approved || 0)}</p>
                  </div>
                </div>
              </div>
              {/* Lead Pipeline */}
              <div className="section-card">
                <h3>Lead Pipeline</h3>
                <div className="leads-pipeline">
                  <ul className="pipeline-list">
                    {['NEW', 'CONTACTED', 'DEMO', 'CLOSED'].map(stage => (
                      <li key={stage}>
                        <strong>{stats.leads?.by_stage?.[stage] || 0}</strong>
                        <span>{stage}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          {/* TODO: Add other tabs */}
        </div>
      </div>
    </div>
  );
}
