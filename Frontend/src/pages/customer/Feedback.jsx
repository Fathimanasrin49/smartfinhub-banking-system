import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { customerApi } from '../../services/customerApi';

export default function Feedback() {
  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState('');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: '', text: '' });

  useEffect(() => {
    customerApi.getBranches().then((r) => {
      if (r.success) setBranches(r.data || []);
    }).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotice({ type: '', text: '' });
    if (!message.trim()) {
      setNotice({ type: 'error', text: 'Please enter your feedback message.' });
      return;
    }
    setLoading(true);
    try {
      const res = await customerApi.submitFeedback(Number(rating), message.trim(), branchId || null);
      if (res.success) {
        setNotice({ type: 'success', text: 'Thanks! Your feedback has been submitted.' });
        setMessage('');
        setRating(5);
        setBranchId('');
      } else {
        setNotice({ type: 'error', text: res.message || 'Failed to submit feedback.' });
      }
    } catch (err) {
      setNotice({ type: 'error', text: err.response?.data?.message || 'Failed to submit feedback.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div style={styles.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Feedback</h1>
        <p style={styles.heroSubtitle}>Share your experience so we can improve our banking services.</p>
      </section>

      <section style={styles.section}>
        <motion.form
          onSubmit={handleSubmit}
          style={styles.form}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {notice.text && (
            <div
              style={{
                ...styles.alert,
                background: notice.type === 'success' ? '#d1fae5' : '#fee2e2',
                color: notice.type === 'success' ? '#059669' : '#dc2626',
              }}
            >
              {notice.text}
            </div>
          )}

          <label style={styles.label}>Branch (optional)</label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            style={styles.input}
          >
            <option value="">Select branch (optional)</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <label style={styles.label}>Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            style={styles.input}
          >
            <option value={5}>5 - Excellent</option>
            <option value={4}>4 - Good</option>
            <option value={3}>3 - Average</option>
            <option value={2}>2 - Poor</option>
            <option value={1}>1 - Very Poor</option>
          </select>

          <label style={styles.label}>Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Tell us what went well and what can be improved..."
            style={{ ...styles.input, resize: 'vertical' }}
          />

          <motion.button
            type="submit"
            disabled={loading}
            style={styles.button}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
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
  section: { padding: '24px 0', maxWidth: 640, margin: '0 auto' },
  form: {
    background: '#fff',
    borderRadius: 16,
    padding: 28,
    border: '1px solid #e2e8f0',
  },
  alert: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    fontSize: 14,
  },
  label: {
    display: 'block',
    marginBottom: 8,
    fontSize: 14,
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    border: '2px solid #e2e8f0',
    marginBottom: 18,
    fontSize: 15,
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  },
  button: {
    width: '100%',
    padding: 14,
    background: '#0d9488',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  },
};
