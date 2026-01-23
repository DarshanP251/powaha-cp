import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuth } from '../auth/AuthContext';
import '../styles/auth.css';

export default function AdminLogin() {
  const [tab, setTab] = useState('ADMIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      const res = await api.post('/auth/login', { email, password, role: tab });
      const { token, role } = res.data;

      if (role !== tab) {
        setError('Unauthorized access');
        return;
      }

      login(token, role);
      if (role === 'ADMIN') navigate('/admin/dashboard');
      else if (role === 'CP') navigate('/cp/dashboard');

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleLogin}>
        <h2>Welcome to POWAHA</h2>
        <div className="role-toggle">
          <button
            type="button"
            className={tab === 'ADMIN' ? 'role-btn active' : 'role-btn'}
            onClick={() => setTab('ADMIN')}
          >
            Admin
          </button>
          <button
            type="button"
            className={tab === 'CP' ? 'role-btn active' : 'role-btn'}
            onClick={() => setTab('CP')}
          >
            Community Partner
          </button>
        </div>
        {error && <p className="error">{error}</p>}
        <input
          type="email"
          placeholder={tab === 'ADMIN' ? 'you@powaha.com' : 'CP Email'}
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" className="primary-btn">Login</button>
        <div className="footer">
          New Partner?{' '}
          <a href="#" onClick={() => navigate('/cp/apply')}>Apply as Community Partner</a>
        </div>
      </form>
    </div>
  );
}
