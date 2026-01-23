import { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/style.css';

export default function Incentives() {
  const [incentives, setIncentives] = useState([]);

  useEffect(() => {
    api.get('/cp/incentives').then(res => setIncentives(res.data));
  }, []);

  return (
    <div className="leads-container">
      <div className="leads-header">
        <h1>My Incentives</h1>
        <p>Approved incentives will be credited after verification.</p>
      </div>
      <div className="card">
        <h3>Incentives Summary</h3>
        <div className="leads-table-wrapper">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Church / Lead</th>
                <th>Location</th>
                <th>Amount (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {incentives.length === 0 ? (
                <tr><td colSpan={4} className="empty-message">No incentives yet.</td></tr>
              ) : incentives.map(i => (
                <tr key={i.incentive_id}>
                  <td>{i.church_name || 'Unknown'}</td>
                  <td>{i.location || '-'}</td>
                  <td>₹ {i.amount}</td>
                  <td><span className={`status ${i.status?.toLowerCase()}`}>{i.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button className="btn-secondary" onClick={() => window.location.href = '/cp/dashboard'}>← Back to Dashboard</button>
      </div>
    </div>
  );
}
