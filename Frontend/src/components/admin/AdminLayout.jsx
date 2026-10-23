import { useEffect, useRef } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

const navItems = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '◈' },
  { path: '/admin/employees', label: 'Employees', icon: '▣' },
  { path: '/admin/customers', label: 'Customers', icon: '◎' },
  { path: '/admin/analytics', label: 'Analytics', icon: '∑' },
  { path: '/admin/logs', label: 'Audit Logs', icon: '▤' },
];

const styles = {
  layout: { display: 'flex', height: '100vh', maxHeight: '100vh', overflow: 'hidden' },
  sidebar: {
    width: 260,
    height: '100vh',
    maxHeight: '100vh',
    background: '#1e293b',
    color: '#f1f5f9',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  brand: {
    padding: 24,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    borderBottom: '1px solid #334155',
  },
  brandIcon: { fontSize: 24, color: '#0d9488' },
  brandName: { fontWeight: 700, fontSize: 18 },
  nav: { flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 4, minHeight: 0, overflowY: 'auto' },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderRadius: 10,
    textDecoration: 'none',
    color: '#94a3b8',
    fontSize: 15,
  },
  navItemActive: {
    background: 'rgba(13,148,136,0.3)',
    color: '#5eead4',
    fontWeight: 600,
  },
  footer: { padding: 16, borderTop: '1px solid #334155' },
  userName: { margin: '0 0 8px', fontSize: 14, fontWeight: 600 },
  logout: {
    padding: '8px 12px',
    background: 'transparent',
    border: '1px solid #475569',
    borderRadius: 8,
    fontSize: 13,
    color: '#94a3b8',
  },
  main: {
    flex: 1,
    minHeight: 0,
    padding: 32,
    overflowY: 'auto',
    background: '#f8fafc',
  },
};

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [location.pathname]);

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <span style={styles.brandIcon}>◆</span>
          <span style={styles.brandName}>Admin Panel</span>
        </div>
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({ ...styles.navItem, ...(isActive ? styles.navItemActive : {}) })}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={styles.footer}>
          <p style={styles.userName}>{user?.name}</p>
          <button onClick={() => { logout(); navigate('/'); }} style={styles.logout}>
            Sign Out
          </button>
        </div>
      </aside>
      <main ref={mainRef} style={styles.main}>{children}</main>
    </div>
  );
}
