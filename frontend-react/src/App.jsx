import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';

/* CP */
import CpApply from './cp/CpApply';
import CpDashboard from './cp/CpDashboard';
import Leads from './cp/Leads';
import CpIncentives from './cp/Incentives';

/* ADMIN */
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import CpApplications from './admin/CpApplications';
import AdminIncentives from './admin/Incentives';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/cp/apply" element={<CpApply />} />

      {/* CP PROTECTED */}
      <Route
        path="/cp/dashboard"
        element={
          <ProtectedRoute role="CP">
            <CpDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cp/leads"
        element={
          <ProtectedRoute role="CP">
            <Leads />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cp/incentives"
        element={
          <ProtectedRoute role="CP">
            <CpIncentives />
          </ProtectedRoute>
        }
      />

      {/* ADMIN PROTECTED */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cp-applications"
        element={
          <ProtectedRoute role="ADMIN">
            <CpApplications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/incentives"
        element={
          <ProtectedRoute role="ADMIN">
            <AdminIncentives />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<h2>404 – Page Not Found</h2>} />
    </Routes>
  );
}

export default App;
