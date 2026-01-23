import { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/admin.css';

export default function AdminIncentives() {
  const [incentives, setIncentives] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/incentives')
      .then(res => setIncentives(res.data))
      .catch(() => setError('Access denied'));
  }, []);

  async function handleApprove(id) {
    try {
      await api.post(`/admin/incentives/${id}/approve`);
      setIncentives(incentives => incentives.map(i =>
        i.incentive_id === id ? { ...i, status: 'APPROVED' } : i
      ));
    } catch {
      setError('Approval failed');
    }
  }

  return (
    <div className="container">
      <header>
        <h1>Incentives</h1>
        <p>Approve pending CP incentives</p>
      </header>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Incentive ID</th>
              <th>CP</th>
              <th>Lead</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {incentives.length === 0 ? (
              <tr><td colSpan={6}>No incentives</td></tr>
            ) : incentives.map(i => (
              <tr key={i.incentive_id}>
                <td>{i.incentive_id}</td>
                <td>{i.cp_id}</td>
                <td>{i.lead_id}</td>
                <td>₹ {i.amount}</td>
                <td>{i.status}</td>
                <td>
                  {i.status === 'PENDING' ? (
                    <button onClick={() => handleApprove(i.incentive_id)}>Approve</button>
                  ) : '-' }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {error && <p className="error-text">{error}</p>}
      </div>
    </div>
  );
}
