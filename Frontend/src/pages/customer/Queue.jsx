import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { customerApi } from '../../services/customerApi';

export default function Queue() {
  const [branches, setBranches] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadBranches = async () => {
    try {
      const res = await customerApi.getBranches();
      if (res.success) setBranches(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadTokens = async () => {
    setLoadingTokens(true);
    try {
      const res = await customerApi.getTokenStatus();
      if (res.success) setTokens(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTokens(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    loadTokens();
    const timer = setInterval(loadTokens, 10000);
    return () => clearInterval(timer);
  }, []);

  const handleGenerate = async () => {
    if (!selectedBranch) {
      setMessage({ type: 'error', text: 'Please select a branch' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await customerApi.generateToken(parseInt(selectedBranch, 10));
      if (res.success) {
        setQrCode(res.data);
        setMessage({
          type: 'success',
          text: `Token ${res.data.token_number} generated! Queue position: ${res.data.queue_position || 'N/A'}`,
        });
        loadTokens();
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to generate token' });
      }
    } catch (e) {
      setMessage({
        type: 'error',
        text: e.response?.data?.message || 'Failed to generate token',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('en-IN');
  const activeToken = tokens.find((t) => t.status === 'waiting');

  return (
    <motion.div
      style={styles.pageWrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Branch Queue</h1>
        <p style={styles.heroSubtitle}>Generate a QR token before visiting a branch.</p>
      </section>

      <section style={styles.section}>
      {activeToken && (
        <div style={styles.activeInfo}>
          Active token: <strong>{activeToken.token_number}</strong> at <strong>{activeToken.branch_name}</strong>. Please wait for your turn.
        </div>
      )}
      <motion.div
        style={styles.card}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 style={styles.cardTitle}>Generate Token</h3>
        <select
          value={selectedBranch}
          onChange={(e) => {
            setSelectedBranch(e.target.value);
            setQrCode(null);
          }}
          style={styles.select}
        >
          <option value="">Select branch</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name} - {b.city}
            </option>
          ))}
        </select>
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
        <motion.button
          onClick={handleGenerate}
          disabled={loading || !selectedBranch || Boolean(activeToken)}
          style={styles.button}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? 'Generating...' : activeToken ? 'You already have an active token' : 'Generate QR Token'}
        </motion.button>

        {qrCode && (
          <motion.div
            style={styles.qrWrap}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img src={qrCode.qrCode} alt="QR Code" style={styles.qr} />
            <p style={styles.tokenNum}>{qrCode.token_number}</p>
            <p style={styles.branchName}>{qrCode.branch_name}</p>
          </motion.div>
        )}
      </motion.div>

      <div style={styles.tokenList}>
        <div style={styles.tokenListHead}>
          <h3 style={styles.listTitle}>Recent Tokens</h3>
          <button type="button" style={styles.refreshBtn} onClick={loadTokens} disabled={loadingTokens}>
            {loadingTokens ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      {tokens.length > 0 ? (
        <div style={styles.tokenList}>
          {tokens.map((t, i) => (
            <motion.div
              key={t.id}
              style={styles.tokenCard}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.03 }}
            >
              <span style={styles.tokenNum2}>{t.token_number}</span>
              <span style={styles.branchName2}>{t.branch_name}</span>
              <span
                style={{
                  ...styles.status,
                  color: t.status === 'served' ? '#059669' : t.status === 'waiting' ? '#d97706' : '#64748b',
                }}
              >
                {t.status}
              </span>
              <span style={styles.date}>{formatDate(t.created_at)}</span>
            </motion.div>
          ))}
        </div>
      ) : (
        <div style={styles.empty}>No queue tokens yet.</div>
      )}
      </div>
      </section>
    </motion.div>
  );
}

const styles = {
  pageWrap: { minHeight: '100vh' },
  hero: { marginBottom: 40, textAlign: 'center' },
  heroTitle: { margin: 0, fontSize: 32, fontWeight: 700, color: '#1e293b' },
  heroSubtitle: { margin: '8px 0 0', fontSize: 16, color: '#64748b' },
  section: { padding: '24px 0' },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 32,
    marginBottom: 24,
    border: '1px solid #e2e8f0',
  },
  cardTitle: { margin: '0 0 20px', fontSize: 18, fontWeight: 600 },
  select: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
    border: '2px solid #e2e8f0',
    marginBottom: 16,
    fontSize: 16,
    boxSizing: 'border-box',
  },
  alert: { padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 14 },
  activeInfo: {
    marginBottom: 14,
    padding: 12,
    borderRadius: 10,
    border: '1px solid #f59e0b',
    background: '#fffbeb',
    color: '#92400e',
    fontSize: 14,
  },
  button: {
    padding: 14,
    background: '#0d9488',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
  },
  qrWrap: {
    marginTop: 24,
    padding: 24,
    background: '#f8fafc',
    borderRadius: 16,
    textAlign: 'center',
  },
  qr: { width: 200, height: 200, marginBottom: 12 },
  tokenNum: { margin: 0, fontSize: 20, fontWeight: 700 },
  branchName: { margin: '4px 0 0', fontSize: 14, color: 'var(--text-muted)' },
  tokenList: { marginTop: 24 },
  tokenListHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  listTitle: { margin: '0 0 16px', fontSize: 16, fontWeight: 600 },
  refreshBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#fff',
    color: '#334155',
    cursor: 'pointer',
  },
  tokenCard: {
    background: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    display: 'grid',
    gridTemplateColumns: '100px 1fr auto auto',
    gap: 16,
    alignItems: 'center',
    border: '1px solid #e2e8f0',
  },
  tokenNum2: { fontWeight: 600 },
  branchName2: { color: '#64748b' },
  status: { textTransform: 'capitalize', fontWeight: 500 },
  date: { fontSize: 12, color: '#64748b' },
  empty: { padding: 16, color: '#64748b', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12 },
};
