import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { pdf } from '@react-pdf/renderer';
import { customerApi } from '../../services/customerApi';
import { PassbookDocument } from './PassbookPdf';

export default function Passbook() {
  const [profile, setProfile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortByDate, setSortByDate] = useState('desc');

  useEffect(() => {
    customerApi.getProfile().then((r) => {
      if (r.success && r.data) setProfile(r.data);
    }).catch(() => {});
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (type) params.type = type;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await customerApi.getTransactions(params);
      if (res.success) setTransactions(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [type, startDate, endDate]);

  const handleDownload = async () => {
    try {
      await customerApi.downloadStatement(startDate || undefined, endDate || undefined);
    } catch (e) {
      console.error(e);
    }
  };

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      const profileRes = await customerApi.getProfile();
      const profile = profileRes?.data || {};
      const doc = (
        <PassbookDocument
          profile={profile}
          transactions={sortedTransactions}
          startDate={startDate}
          endDate={endDate}
        />
      );
      const blob = await pdf(doc).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `passbook-${startDate || 'all'}-${endDate || 'all'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN');
  const formatAmount = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);

  const sortedTransactions = useMemo(() => {
    if (!transactions.length) return [];
    const copy = [...transactions];
    copy.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortByDate === 'asc' ? da - db : db - da;
    });
    return copy;
  }, [transactions, sortByDate]);

  return (
    <motion.div
      style={styles.pageWrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Digital Passbook</h1>
        <p style={styles.heroSubtitle}>View and download your transaction history.</p>
        {profile?.account_number && (
          <p style={styles.accountNumber}>Account number: <strong>{profile.account_number}</strong></p>
        )}
      </section>

      <section style={styles.section}>
      <div style={styles.filters}>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={styles.select}
        >
          <option value="">All types</option>
          <option value="credit">Credit</option>
          <option value="debit">Debit</option>
        </select>
        <select
          value={sortByDate}
          onChange={(e) => setSortByDate(e.target.value)}
          style={styles.select}
          title="Sort by date"
        >
          <option value="desc">Newest first</option>
          <option value="asc">Oldest first</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={styles.input}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={styles.input}
        />
        <motion.button
          onClick={handleDownload}
          style={styles.downloadBtn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Download Statement (JSON)
        </motion.button>
        <motion.button
          onClick={handleDownloadPdf}
          style={styles.downloadPdfBtn}
          disabled={downloadingPdf || sortedTransactions.length === 0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {downloadingPdf ? 'Generating PDF…' : 'Download Passbook (PDF)'}
        </motion.button>
      </div>

      <motion.div
        style={styles.tableWrap}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <p style={styles.loading}>Loading...</p>
        ) : sortedTransactions.length === 0 ? (
          <p style={styles.empty}>No transactions found.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <td>{formatDate(t.created_at)}</td>
                  <td>
                    <span
                      style={{
                        ...styles.badge,
                        background: t.type === 'credit' ? '#d1fae5' : '#fee2e2',
                        color: t.type === 'credit' ? '#059669' : '#dc2626',
                      }}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td>{t.description || t.transaction_id}</td>
                  <td>{t.category}</td>
                  <td style={{ color: t.type === 'credit' ? 'var(--success)' : 'var(--danger)' }}>
                    {t.type === 'credit' ? '+' : '-'}{formatAmount(t.amount)}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </motion.div>
      </section>
    </motion.div>
  );
}

const styles = {
  pageWrap: { minHeight: '100vh' },
  hero: { marginBottom: 40, textAlign: 'center' },
  heroTitle: { margin: 0, fontSize: 32, fontWeight: 700, color: '#1e293b' },
  heroSubtitle: { margin: '8px 0 0', fontSize: 16, color: '#64748b' },
  accountNumber: { margin: '12px 0 0', fontSize: 15, color: '#64748b' },
  section: { padding: '24px 0' },
  filters: {
    display: 'flex',
    gap: 12,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  select: { padding: '10px 14px', borderRadius: 10, border: '2px solid #e2e8f0' },
  input: { padding: '10px 14px', borderRadius: 10, border: '2px solid #e2e8f0' },
  downloadBtn: {
    padding: '10px 20px',
    background: '#0d9488',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
  },
  downloadPdfBtn: {
    padding: '10px 20px',
    background: '#1e293b',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
  },
  tableWrap: {
    background: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    border: '1px solid #e2e8f0',
  },
  loading: { padding: 40, textAlign: 'center', color: '#64748b' },
  empty: { padding: 40, textAlign: 'center', color: '#64748b' },
  table: { width: '100%', borderCollapse: 'collapse' },
  badge: {
    padding: '4px 10px',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 600,
  },
};
