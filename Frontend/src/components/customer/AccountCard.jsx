import { motion } from 'framer-motion';

export default function AccountCard({ profile }) {
  return (
    <motion.div
      style={styles.card}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 }}
    >
      <div style={styles.header}>
        <span style={styles.label}>Account Details</span>
        <span
          style={{
            ...styles.badge,
            background: profile?.kyc_status === 'verified' ? '#d1fae5' : '#fef3c7',
            color: profile?.kyc_status === 'verified' ? '#059669' : '#d97706',
          }}
        >
          {profile?.kyc_status || 'pending'}
        </span>
      </div>
      <div style={styles.body}>
        <p style={styles.name}>{profile?.name}</p>
        <p style={styles.account}>Account: {profile?.account_number}</p>
        <p style={styles.email}>{profile?.email}</p>
        <p style={styles.phone}>{profile?.phone}</p>
      </div>
    </motion.div>
  );
}

const styles = {
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
    border: '1px solid var(--border)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: 600,
  },
  badge: {
    padding: '4px 10px',
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  name: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--text)',
  },
  account: {
    margin: 0,
    fontSize: 14,
    color: 'var(--text-muted)',
  },
  email: { margin: 0, fontSize: 14, color: 'var(--text-muted)' },
  phone: { margin: 0, fontSize: 14, color: 'var(--text-muted)' },
};
