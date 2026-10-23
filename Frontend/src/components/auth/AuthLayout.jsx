const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #f8fafc 100%)',
    padding: 24,
  },
  card: {
    background: '#fff',
    borderRadius: 24,
    padding: 48,
    boxShadow: '0 25px 50px -12px rgba(13, 148, 136, 0.15)',
    width: '100%',
    maxWidth: 420,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: 'var(--text-muted)',
    fontSize: 14,
  },
};

export default function AuthLayout({ children, subtitle = 'Customer Portal' }) {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {subtitle && <p style={styles.subtitle}>{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}

