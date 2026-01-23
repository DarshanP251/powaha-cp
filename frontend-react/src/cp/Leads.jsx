import { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/style.css';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [church, setChurch] = useState('');
  const [location, setLocation] = useState('');
  const [contact, setContact] = useState('');
  const [mobile, setMobile] = useState('');
  const [aoo, setAoo] = useState([]);

  useEffect(() => {
    api.get('/cp/dashboard').then(res => {
      setAoo(res.data.aoo || []);
    });
    loadLeads();
  }, []);

  function loadLeads() {
    api.get('/cp/leads').then(res => setLeads(res.data));
  }

  async function addLead(e) {
    e.preventDefault();
    if (!church || !location || !mobile) return;
    await api.post('/cp/leads', {
      church_name: church,
      location,
      contact_person: contact,
      contact_mobile: mobile
    });
    setChurch('');
    setLocation('');
    setContact('');
    setMobile('');
    loadLeads();
  }

  async function updateStage(leadId, stage) {
    await api.patch(`/cp/leads/${leadId}/stage`, { stage });
    loadLeads();
  }

  return (
    <div className="leads-container">
      <div className="leads-header">
        <h1>My Leads</h1>
        <p>You can create leads only within your assigned Area of Operation.</p>
      </div>
      <div className="card">
        <h3>Add New Lead</h3>
        <form className="leads-form" onSubmit={addLead}>
          <div className="form-row">
            <input
              value={church}
              onChange={e => setChurch(e.target.value)}
              type="text"
              placeholder="Church Name"
              required
            />
            <select value={location} onChange={e => setLocation(e.target.value)} required>
              <option value="">Select Location (AOO)</option>
              {aoo.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <input
              value={contact}
              onChange={e => setContact(e.target.value)}
              type="text"
              placeholder="Contact Person"
            />
            <input
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              type="tel"
              placeholder="Contact Mobile"
              required
            />
          </div>
          <button type="submit" className="btn-primary">Add Lead</button>
        </form>
      </div>
      <div className="card">
        <h3>Your Leads</h3>
        <div className="leads-table-wrapper">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Church</th>
                <th>Location</th>
                <th>Stage</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 ? (
                <tr><td colSpan={4} className="empty-message">No leads yet. Add your first lead above.</td></tr>
              ) : leads.map(l => (
                <tr key={l.lead_id}>
                  <td>{l.church_name}</td>
                  <td>{l.location}</td>
                  <td>{l.stage}</td>
                  <td>
                    <select
                      value={l.stage}
                      onChange={e => updateStage(l.lead_id, e.target.value)}
                      disabled={l.stage === 'CLOSED'}
                    >
                      {['NEW', 'CONTACTED', 'DEMO', 'CLOSED'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
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
