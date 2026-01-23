import { useState, useEffect } from 'react';
import api from '../api/api';
import '../styles/auth.css';

export default function Status() {
  const [status, setStatus] = useState('Loading...');
  const [message, setMessage] = useState('Please wait while we fetch your application status.');
  const [indicator, setIndicator] = useState('pending');

  useEffect(() => {
    const email = localStorage.getItem('lastAppliedEmail');
    if (!email) {
      setStatus('Application Submitted');
      setMessage('Your application has been submitted successfully. Our team will review it shortly.');
      setIndicator('pending');
      return;
    }
    api.get(`/cp/application-status?email=${encodeURIComponent(email)}`)
      .then(res => {
        const data = res.data;
        if (data.status === 'SUBMITTED') {
          setStatus('Application Under Review');
          setMessage('Your application has been received and is currently under review.');
          setIndicator('pending');
        } else if (data.status === 'APPROVED') {
          setStatus('Application Approved');
          setMessage('Congratulations! Your application has been approved. You can now log in and start managing leads.');
          setIndicator('approved');
        } else if (data.status === 'REJECTED') {
          setStatus('Application Rejected');
          setMessage('Sorry, your application was not approved. You may contact support for more info.');
          setIndicator('rejected');
        } else {
          setStatus('Unknown Status');
          setMessage('Unable to determine application status.');
          setIndicator('pending');
        }
      })
      .catch(() => {
        setStatus('Error');
        setMessage('Failed to fetch status.');
        setIndicator('pending');
      });
  }, []);

  return (
    <div className="auth-wrapper">
      <div className="auth-card status-card">
        <h2>Community Partner Application</h2>
        <p className="subtitle">Track the status of your application</p>
        <div className="status-box">
          <div className={`status-indicator ${indicator}`}></div>
          <div className="status-content">
            <h3>{status}</h3>
            <p>{message}</p>
          </div>
        </div>
        <div className="status-info">
          <h4>What happens next?</h4>
          <ul>
            <li>Your application is reviewed by the POWAHA team</li>
            <li>You may be contacted for further discussion</li>
            <li>Once approved, you can log in and start managing leads</li>
          </ul>
        </div>
        <div className="actions">
          <a href="/cp/apply" className="secondary-link">Go to Login</a>
        </div>
      </div>
    </div>
  );
}
