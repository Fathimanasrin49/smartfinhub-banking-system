import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import { customerApi } from '../../services/customerApi';

export default function Transfer() {
  const { user } = useAuth();
  const [myAccountNumber, setMyAccountNumber] = useState(user?.account_number || '');
  const [kycRejected, setKycRejected] = useState(false);
  const [receiverAccount, setReceiverAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    customerApi.getProfile().then((r) => {
      if (r.success && r.data) {
        if (r.data.account_number) setMyAccountNumber(r.data.account_number);
        setKycRejected(r.data.kyc_status === 'rejected');
      }
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);
    try {
      const res = await customerApi.transfer(
        receiverAccount.trim(),
        parseFloat(amount),
        description || 'Fund Transfer'
      );
      if (res.success) {
        setMessage({ type: 'success', text: `Transfer successful! New balance: ₹${res.data.newBalance?.toLocaleString()}` });
        setReceiverAccount('');
        setAmount('');
        setDescription('');
      } else {
        setMessage({ type: 'error', text: res.message || 'Transfer failed' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Transfer failed',
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
        <h1 style={styles.heroTitle}>Fund Transfer</h1>
        <p style={styles.heroSubtitle}>Transfer money to another account using their account number.</p>
        {myAccountNumber && (
          <div style={styles.myAccountBox}>
            <span style={styles.myAccountLabel}>Your account number (share this to receive money)</span>
            <span style={styles.myAccountValue}>{myAccountNumber}</span>
          </div>
        )}
      </section>

      <section style={styles.section}>
      {kycRejected ? (
        <motion.div
          style={{ ...styles.form, background: '#fef2f2', border: '1px solid #fecaca' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p style={{ margin: 0, fontSize: 16, color: '#991b1b', fontWeight: 600 }}>
            Transfers are not allowed
          </p>
          <p style={{ margin: '12px 0 0', fontSize: 14, color: '#b91c1c' }}>
            Your KYC has been rejected by the bank. Please contact your branch to resolve this. You cannot transfer funds to another account until your KYC is verified.
          </p>
        </motion.div>
      ) : (
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
              background: message.type === 'success' ? '#d1fae5' : '#fee2e2',
              color: message.type === 'success' ? '#059669' : '#dc2626',
            }}
          >
            {message.text}
          </div>
        )}
        <label style={styles.label}>Beneficiary account number</label>
        <input
          type="text"
          value={receiverAccount}
          onChange={(e) => setReceiverAccount(e.target.value)}
          placeholder="Enter receiver's account number (e.g. ACC12345678)"
          required
          style={styles.input}
        />
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
          placeholder="e.g. Rent payment"
          style={styles.input}
        />
        <motion.button
          type="submit"
          disabled={loading}
          style={styles.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Transferring...' : 'Transfer'}
        </motion.button>
      </motion.form>
      )}
      </section>
    </motion.div>
  );
}

const styles = {
  pageWrap: { minHeight: '100vh' },
  hero: { marginBottom: 40, textAlign: 'center' },
  heroTitle: { margin: 0, fontSize: 32, fontWeight: 700, color: '#1e293b' },
  heroSubtitle: { margin: '8px 0 0', fontSize: 16, color: '#64748b' },
  myAccountBox: {
    marginTop: 16,
    padding: '12px 20px',
    background: '#f0fdfa',
    borderRadius: 12,
    border: '1px solid #99f6e4',
    display: 'inline-flex',
    flexDirection: 'column',
    gap: 4,
  },
  myAccountLabel: { fontSize: 12, color: '#64748b', fontWeight: 500 },
  myAccountValue: { fontSize: 18, fontWeight: 700, color: '#0f766e', letterSpacing: '0.02em' },
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
