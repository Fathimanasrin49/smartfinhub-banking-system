import { motion } from 'framer-motion';

export default function BalanceCard({ balance, loading }) {
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(balance ?? 0);

  return (
    <motion.div
      style={styles.card}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <p style={styles.label}>Available Balance</p>
      <p style={styles.amount}>
        {loading ? '...' : formatted}
      </p>
      <div style={styles.accent} />
    </motion.div>
  );
}

const styles = {
  card: {
    background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
    borderRadius: 20,
    padding: 28,
    color: '#fff',
    position: 'relative',
    overflow: 'hidden',
  },
  label: {
    margin: '0 0 8px',
    fontSize: 14,
    opacity: 0.9,
  },
  amount: {
    margin: 0,
    fontSize: 32,
    fontWeight: 700,
  },
  accent: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
  },
};
