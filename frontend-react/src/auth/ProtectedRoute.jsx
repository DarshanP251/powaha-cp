import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function ProtectedRoute({ role: requiredRole, children }) {
  const { token, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!token) {
    return <Navigate to="/cp/apply" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/cp/apply" replace />;
  }

  return children;
}
