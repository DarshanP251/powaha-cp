import { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/admin.css';

const AOO_OPTIONS = [
  'Bangalore Urban', 'Mysuru', 'Tumakuru', 'District A', 'District B'
];

export default function CpApplications() {
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [aooSelected, setAooSelected] = useState([]);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/cp-applications').then(res => {
      setApplications(res.data.filter(app => app.status === 'SUBMITTED'));
    });
  }, [success, error]);

  function openModal(app) {
    setSelectedApp(app);
    setAooSelected([]);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setSelectedApp(null);
    setAooSelected([]);
    setSuccess('');
    setError('');
  }

  async function handleApprove() {
    if (!aooSelected.length) {
      setError('Please select at least one area of operation');
      return;
    }
    try {
      await api.post(`/admin/cp/${selectedApp.cp_id}/approve`, { aoo: aooSelected });
      setSuccess('CP has been approved successfully');
      setModalOpen(false);
    } catch {
      setError('Approval failed');
    }
  }

  async function handleReject() {
    try {
      await api.post(`/admin/cp/${selectedApp.cp_id}/reject`);
      setError('CP application has been rejected');
      setModalOpen(false);
    } catch {
      setError('Rejection failed');
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>CP Applications</h1>
        <p>Review and approve Community Partner applications</p>
      </div>
      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>CP ID</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr><td colSpan={4}>No pending applications</td></tr>
            ) : applications.map(app => (
              <tr key={app.cp_id}>
                <td>{app.cp_id}</td>
                <td>{app.status}</td>
                <td>{new Date(app.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="btn-small" onClick={() => openModal(app)}>Review</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal for review/approve/reject */}
      {modalOpen && selectedApp && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Review Application</h2>
            <p><strong>CP ID:</strong> {selectedApp.cp_id}</p>
            <p><strong>Status:</strong> {selectedApp.status}</p>
            <div>
              <h3>Select Area of Operation (AOO)</h3>
              <div className="district-list">
                {AOO_OPTIONS.map(aoo => (
                  <label key={aoo}>
                    <input
                      type="checkbox"
                      value={aoo}
                      checked={aooSelected.includes(aoo)}
                      onChange={e => {
                        if (e.target.checked) {
                          setAooSelected([...aooSelected, aoo]);
                        } else {
                          setAooSelected(aooSelected.filter(x => x !== aoo));
                        }
                      }}
                    />
                    {aoo}
                  </label>
                ))}
              </div>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={closeModal}>Cancel</button>
              <button className="confirm-btn" onClick={handleApprove}>Approve with AOO</button>
              <button className="btn-danger" onClick={handleReject}>Reject</button>
            </div>
            {error && <p className="error-text">{error}</p>}
          </div>
        </div>
      )}
      {/* Success/Error Modals */}
      {success && (
        <div className="modal-overlay">
          <div className="modal confirmation-modal success">
            <div className="icon">✓</div>
            <h2>Approved!</h2>
            <p>{success}</p>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={() => setSuccess('')}>Continue</button>
            </div>
          </div>
        </div>
      )}
      {error && !modalOpen && (
        <div className="modal-overlay">
          <div className="modal confirmation-modal error">
            <div className="icon">✕</div>
            <h2>Rejected</h2>
            <p>{error}</p>
            <div className="modal-actions">
              <button className="confirm-btn" onClick={() => setError('')}>Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
