import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

/**
 * Renders children only if user is NOT logged in.
 * If logged in, redirects to role-based dashboard.
 */
export default function AuthRedirect({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc' }}>
        <span style={{ fontSize: 18, color: '#64748b' }}>Loading...</span>
      </div>
    );
  }

  if (user) {
    const dest = user.role === 'admin' ? '/admin/dashboard' : user.role === 'employee' ? '/employee/dashboard' : '/customer/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
}
