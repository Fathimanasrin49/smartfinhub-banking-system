import { useState } from 'react';
import { motion } from 'framer-motion';
import { customerApi } from '../../services/customerApi';

export default function Deposit() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('Cash Deposit');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
      const res = await customerApi.deposit(parseFloat(amount), description);
      if (res.success) {
        setMessage({
          type: res.data?.pending ? 'info' : 'success',
          text: res.data?.pending
            ? 'Deposit request submitted. Pending employee approval.'
            : `Deposit successful! New balance: ₹${res.data.newBalance?.toLocaleString()}`,
        });
        setAmount('');
      } else {
        setMessage({ type: 'error', text: res.message || 'Deposit failed' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Deposit failed',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      style={styles.pageWrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Deposit</h1>
        <p style={styles.heroSubtitle}>Add money to your account.</p>
      </section>

      <section style={styles.section}>
      <motion.form
        onSubmit={handleSubmit}
        style={styles.form}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {message.text && (
          <div
            style={{
              ...styles.alert,
              background: message.type === 'success' ? '#d1fae5' : message.type === 'info' ? '#e0f2fe' : '#fee2e2',
              color: message.type === 'success' ? '#059669' : message.type === 'info' ? '#0284c7' : '#dc2626',
            }}
          >
            {message.text}
          </div>
        )}
        <label style={styles.label}>Amount (₹)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="1"
          step="0.01"
          required
          style={styles.input}
        />
        <label style={styles.label}>Description (optional)</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Cash Deposit"
          style={styles.input}
        />
        <motion.button
          type="submit"
          disabled={loading}
          style={styles.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Processing...' : 'Deposit'}
        </motion.button>
      </motion.form>
      </section>
    </motion.div>
  );
}

const styles = {
  pageWrap: { minHeight: '100vh' },
  hero: { marginBottom: 40, textAlign: 'center' },
  heroTitle: { margin: 0, fontSize: 32, fontWeight: 700, color: '#1e293b' },
  heroSubtitle: { margin: '8px 0 0', fontSize: 16, color: '#64748b' },
  section: { padding: '24px 0', maxWidth: 480, margin: '0 auto' },
  form: {
    background: '#fff',
    borderRadius: 16,
    padding: 32,
    border: '1px solid #e2e8f0',
  },
  alert: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 14,
  },
  label: { display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 },
  input: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    border: '2px solid #e2e8f0',
    marginBottom: 20,
    fontSize: 16,
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: 16,
    background: '#0d9488',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
