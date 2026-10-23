import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Protects routes - redirects to /login if not authenticated.
 * Optionally restricts by role (customer, employee, admin).
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <span style={{ fontSize: 18, color: '#64748b' }}>Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const dest = user.role === 'admin' ? '/admin/dashboard' : user.role === 'employee' ? '/employee/dashboard' : '/customer/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}
