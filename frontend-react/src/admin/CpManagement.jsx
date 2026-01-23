import { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/admin.css';

export default function CpManagement() {
  const [partners, setPartners] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/admin/cp-applications')
      .then(res => setPartners(res.data.filter(app => app.status === 'APPROVED')));
  }, []);

  function viewDetails(cp) {
    setSelected(cp);
  }
  function closeDetails() {
    setSelected(null);
  }

  return (
    <div className="container">
      <div className="header">
        <h1>CP Partners</h1>
        <p>List of active Community Partners</p>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>CP ID</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {partners.length === 0 ? (
              <tr><td colSpan={3}>No active partners</td></tr>
            ) : partners.map(cp => (
              <tr key={cp.cp_id}>
                <td>{cp.cp_id}</td>
                <td><span className="badge active">ACTIVE</span></td>
                <td>
                  <button className="btn-small" onClick={() => viewDetails(cp)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Details Modal */}
      {selected && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Partner Details</h2>
            <p><strong>CP ID:</strong> {selected.cp_id}</p>
            <p><strong>Status:</strong> {selected.status}</p>
            <button className="cancel-btn" onClick={closeDetails}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
