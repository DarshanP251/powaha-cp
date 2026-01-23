import { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/admin.css';

export default function Settings() {
  const [config, setConfig] = useState([]);
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/admin/incentive-config').then(res => {
      setConfig(Array.isArray(res.data) ? res.data : [res.data]);
    });
  }, [message]);

  async function handleUpdate(e) {
    e.preventDefault();
    try {
      await api.post('/admin/incentive-config', { key, value: Number(value) });
      setMessage('Config updated');
      setKey('');
      setValue('');
    } catch {
      setMessage('Update failed');
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Settings</h1>
        <p>Update incentive configuration</p>
      </div>
      <div className="card">
        <h3>Current Config</h3>
        <ul>
          {config.map(c => (
            <li key={c.key}>{c.key}: ₹ {c.value}</li>
          ))}
        </ul>
        <form onSubmit={handleUpdate} className="settings-form">
          <input
            type="text"
            placeholder="Config Key"
            value={key}
            onChange={e => setKey(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Value"
            value={value}
            onChange={e => setValue(e.target.value)}
            required
          />
          <button type="submit">Update</button>
        </form>
        {message && <p className="info-text">{message}</p>}
      </div>
    </div>
  );
}
