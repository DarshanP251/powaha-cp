import '../styles/admin.css';

export default function Activity() {
  return (
    <div className="container">
      <div className="header">
        <h1>Activity Log</h1>
        <p>Audit logs are stored in backend/logs/audit.log</p>
      </div>
      <div className="card">
        <p className="info-text">Activity logs are stored in <code>backend/logs/audit.log</code></p>
      </div>
    </div>
  );
}
