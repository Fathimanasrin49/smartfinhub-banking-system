import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { customerApi } from '../../services/customerApi';

const navItems = [
  { path: '/customer/dashboard', label: 'Home' },
  { path: '/customer/passbook', label: 'Passbook' },
  { path: '/customer/transfer', label: 'Transfer' },
  { path: '/customer/deposit', label: 'Deposit' },
  { path: '/customer/withdraw', label: 'Withdraw' },
  { path: '/customer/expenses', label: 'Expenses' },
  { path: '/customer/feedback', label: 'Feedback' },
  { path: '/customer/queue', label: 'Branch Queue' },
];

const footerLinks = {
  Banking: [
    { to: '/customer/dashboard', label: 'Home' },
    { to: '/customer/passbook', label: 'Passbook' },
    { to: '/customer/transfer', label: 'Transfer' },
    { to: '/customer/deposit', label: 'Deposit' },
    { to: '/customer/withdraw', label: 'Withdraw' },
  ],
  Support: [
    { to: '/customer/queue', label: 'Branch Queue' },
    { to: '/customer/expenses', label: 'Expenses' },
    { to: '/customer/feedback', label: 'Feedback' },
  ],
};

export default function CustomerLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const mainRef = useRef(null);
  const readIdsKey = user?.id ? `customer_notifications_read_ids_${user.id}` : null;

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
    setMenuOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  const loadNotifications = async () => {
    setNotificationsLoading(true);
    try {
      const res = await customerApi.getAlerts();
      if (res.success) {
        const list = res.data || [];
        setNotifications(list);
        const readSet = new Set(readNotificationIds);
        const unread = list.filter((n) => !readSet.has(String(n.id))).length;
        setNotificationsCount(unread);
      } else {
        setNotifications([]);
        setNotificationsCount(0);
      }
    } catch {
      setNotifications([]);
      setNotificationsCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    const next = !notificationsOpen;
    setNotificationsOpen(next);
    if (next) await loadNotifications();
  };

  useEffect(() => {
    if (!user?.id) return;
    const stored = localStorage.getItem(`customer_notifications_read_ids_${user.id}`);
    if (!stored) {
      setReadNotificationIds([]);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setReadNotificationIds(Array.isArray(parsed) ? parsed.map((x) => String(x)) : []);
    } catch {
      setReadNotificationIds([]);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    // Load count silently in the background
    loadNotifications();
    const timer = setInterval(() => loadNotifications(), 30000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, readNotificationIds]);

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => String(n.id));
    const merged = Array.from(new Set([...readNotificationIds, ...allIds]));
    setReadNotificationIds(merged);
    setNotificationsCount(0);
    if (readIdsKey) localStorage.setItem(readIdsKey, JSON.stringify(merged));
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <NavLink to="/customer/dashboard" style={styles.logo} className="customer-layout-logo">
            <span style={styles.logoIcon}>◆</span>
            <span style={styles.logoText}>Smart Fin Hub</span>
          </NavLink>
          <nav style={styles.nav}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="customer-nav-link"
                style={({ isActive }) => ({
                  ...styles.navLink,
                  ...(isActive ? styles.navLinkActive : {}),
                })}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div style={styles.userBar}>
            <div style={styles.notificationsWrap}>
              <button
                type="button"
                onClick={handleToggleNotifications}
                style={styles.notificationsBtn}
                title="Notifications"
              >
                🔔
                {notificationsCount > 0 && (
                  <span style={styles.notificationsBadge} aria-label={`${notificationsCount} notifications`}>
                    {notificationsCount > 99 ? '99+' : notificationsCount}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div style={styles.notificationsPanel}>
                  <div style={styles.notificationsHead}>
                    <span style={styles.notificationsTitle}>Notifications</span>
                    <div style={styles.notificationsHeadActions}>
                      <button type="button" style={styles.markReadBtn} onClick={handleMarkAllAsRead} disabled={!notifications.length}>
                        Mark all as read
                      </button>
                      <button type="button" style={styles.refreshNotifBtn} onClick={loadNotifications} disabled={notificationsLoading}>
                        {notificationsLoading ? 'Loading...' : 'Refresh'}
                      </button>
                    </div>
                  </div>
                  {notificationsLoading ? (
                    <p style={styles.notificationsEmpty}>Loading notifications...</p>
                  ) : notifications.length === 0 ? (
                    <p style={styles.notificationsEmpty}>No notifications found.</p>
                  ) : (
                    <div style={styles.notificationsList}>
                      {notifications.slice(0, 6).map((n) => (
                        <div key={n.id} style={styles.notificationItem}>
                          <p style={styles.notificationText}>{n.ai_message || n.message || 'Notification'}</p>
                          <span style={styles.notificationTime}>
                            {n.created_at ? new Date(n.created_at).toLocaleString('en-IN') : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={styles.userMenuWrap}>
              <button
                type="button"
                style={styles.userBadgeBtn}
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span style={styles.userAvatar}>{user?.name?.charAt(0)?.toUpperCase() || '?'}</span>
                <span style={styles.userName}>{user?.name}</span>
                <span style={styles.chevron}>▾</span>
              </button>
              {menuOpen && (
                <div style={styles.userDropdown} role="menu">
                  <button
                    type="button"
                    onClick={handleLogout}
                    style={styles.dropdownItem}
                    className="customer-logout-btn"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main ref={mainRef} style={styles.main}>
        <div style={styles.container}>{children}</div>
        <footer style={styles.footer}>
          <div style={styles.footerInner}>
            <div style={styles.footerGrid}>
              <div style={styles.footerBrand}>
                <span style={styles.footerLogoIcon}>◆</span>
                <span style={styles.footerLogoText}>Smart Fin Hub</span>
                <p style={styles.footerTagline}>Your trusted digital banking partner.</p>
              </div>
              {Object.entries(footerLinks).map(([title, links]) => (
                <div key={title} style={styles.footerCol}>
                  <h4 style={styles.footerColTitle}>{title}</h4>
                  <ul style={styles.footerList}>
                    {links.map(({ to, label }) => (
                      <li key={to}>
                        <NavLink to={to} style={styles.footerLink} className="footer-link">
                          {label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <div style={styles.footerCol}>
                <h4 style={styles.footerColTitle}>Contact</h4>
                <p style={styles.footerContact}>support@smartfinhub.com</p>
                <p style={styles.footerContact}>24/7 Helpline: 1800-123-4567</p>
              </div>
            </div>
            <div style={styles.footerBottom}>
              <span>© {new Date().getFullYear()} Smart Fin Hub. All rights reserved.</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

const styles = {
  page: {
    height: '100vh',
    maxHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#f8fafc',
  },
  header: {
    flexShrink: 0,
    background: '#fff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '0 32px',
    height: 72,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 20,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 22,
    fontWeight: 700,
    color: '#0f766e',
    textDecoration: 'none',
    letterSpacing: '-0.02em',
    whiteSpace: 'nowrap',
  },
  logoIcon: {
    fontSize: 28,
    color: '#0d9488',
    lineHeight: 1,
  },
  logoText: {
    background: 'linear-gradient(135deg, #0d9488, #0f766e)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    whiteSpace: 'nowrap',
  },
  nav: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    flexWrap: 'nowrap',
    whiteSpace: 'nowrap',
  },
  navLink: {
    padding: '10px 16px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    color: '#64748b',
    textDecoration: 'none',
    transition: 'background 0.2s, color 0.2s',
  },
  navLinkActive: {
    background: 'linear-gradient(135deg, rgba(13,148,136,0.12), rgba(13,148,136,0.06))',
    color: '#0d9488',
    fontWeight: 600,
  },
  userBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  notificationsWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  notificationsBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    background: '#f8fafc',
    cursor: 'pointer',
    fontSize: 16,
  },
  notificationsBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 20,
    height: 20,
    padding: '0 6px',
    background: '#dc2626',
    color: '#fff',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 800,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(220,38,38,0.3)',
  },
  userMenuWrap: {
    position: 'relative',
  },
  userBadgeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '6px 12px',
    background: '#f1f5f9',
    borderRadius: 10,
    border: '1px solid #e2e8f0',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0d9488, #0f766e)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
  },
  userName: {
    fontSize: 14,
    fontWeight: 600,
    color: '#334155',
    maxWidth: 140,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  chevron: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 2,
  },
  userDropdown: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    minWidth: 140,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
    padding: 6,
    zIndex: 20,
  },
  dropdownItem: {
    width: '100%',
    padding: '10px 12px',
    background: 'transparent',
    border: 'none',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    color: '#334155',
    textAlign: 'left',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  notificationsPanel: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    width: 360,
    maxHeight: 380,
    overflow: 'hidden',
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 10,
    boxShadow: '0 8px 20px rgba(15, 23, 42, 0.12)',
    zIndex: 22,
  },
  notificationsHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderBottom: '1px solid #e2e8f0',
  },
  notificationsTitle: { fontSize: 14, fontWeight: 700, color: '#1e293b' },
  notificationsHeadActions: { display: 'flex', alignItems: 'center', gap: 6 },
  markReadBtn: {
    border: '1px solid #cbd5e1',
    background: '#f8fafc',
    borderRadius: 8,
    padding: '6px 8px',
    fontSize: 12,
    color: '#334155',
    cursor: 'pointer',
  },
  refreshNotifBtn: {
    border: '1px solid #cbd5e1',
    background: '#fff',
    borderRadius: 8,
    padding: '6px 8px',
    fontSize: 12,
    color: '#334155',
    cursor: 'pointer',
  },
  notificationsList: {
    maxHeight: 320,
    overflowY: 'auto',
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  notificationItem: {
    padding: 10,
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    background: '#f8fafc',
  },
  notificationText: {
    margin: 0,
    color: '#334155',
    fontSize: 13,
    lineHeight: 1.4,
  },
  notificationTime: {
    marginTop: 6,
    display: 'block',
    color: '#64748b',
    fontSize: 11,
  },
  notificationsEmpty: {
    margin: 0,
    padding: 16,
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 0,
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '48px 24px 0',
  },
  footer: {
    background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    color: '#94a3b8',
    padding: '48px 24px 24px',
    fontSize: 14,
  },
  footerInner: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: '1.5fr repeat(3, 1fr)',
    gap: 40,
    paddingBottom: 32,
    borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
    marginBottom: 24,
  },
  footerBrand: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  footerLogoIcon: {
    fontSize: 28,
    color: '#5eead4',
    lineHeight: 1,
  },
  footerLogoText: {
    fontSize: 20,
    fontWeight: 700,
    color: '#f1f5f9',
    letterSpacing: '-0.02em',
  },
  footerTagline: {
    margin: 0,
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  footerCol: {},
  footerColTitle: {
    margin: '0 0 16px',
    fontSize: 12,
    fontWeight: 600,
    color: '#f1f5f9',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  footerList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  footerLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  footerContact: {
    margin: '0 0 6px',
    fontSize: 14,
    color: '#94a3b8',
    lineHeight: 1.5,
  },
  footerBottom: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 13,
  },
};
