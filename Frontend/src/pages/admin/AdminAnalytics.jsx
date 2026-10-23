import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/adminApi';

export default function AdminAnalytics() {
  const [txns, setTxns] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [risks, setRisks] = useState([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.getAnalyticsTransactions(days),
      adminApi.getAnalyticsExpenses(),
      adminApi.getAnalyticsRisks(),
    ]).then(([r1, r2, r3]) => {
      if (r1.success) setTxns(r1.data || []);
      if (r2.success) setExpenses(r2.data || []);
      if (r3.success) setRisks(r3.data || []);
      setLoading(false);
    });
  }, [days]);

  const formatAmt = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN')}`;

  if (loading) return <p>Loading...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={styles.title}>Analytics</h1>
      <p style={styles.subtitle}>Transaction volume, expense patterns, risk reports</p>

      <div style={styles.filters}>
        <label>Period: </label>
        <select value={days} onChange={(e) => setDays(parseInt(e.target.value, 10))} style={styles.select}>
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Transaction Volume (last {days} days)</h3>
          <div style={styles.txnList}>
            {txns.length === 0 ? (
              <p style={styles.empty}>No data</p>
            ) : (
              txns.map((t) => (
                <div key={t.date} style={styles.txnRow}>
                  <span>{new Date(t.date).toLocaleDateString()}</span>
                  <span>{t.count} txns</span>
                  <span>{formatAmt(t.volume)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Expense by Category (30 days)</h3>
          <div style={styles.expList}>
            {expenses.length === 0 ? (
              <p style={styles.empty}>No data</p>
            ) : (
              expenses.map((e) => (
                <div key={e.category} style={styles.expRow}>
                  <span style={{ textTransform: 'capitalize' }}>{e.category}</span>
                  <span>{formatAmt(e.total)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Risk Levels (30 days)</h3>
          <div style={styles.riskList}>
            {risks.length === 0 ? (
              <p style={styles.empty}>No alerts</p>
            ) : (
              risks.map((r) => (
                <div key={r.risk_level} style={styles.riskRow}>
                  <span style={{ textTransform: 'capitalize' }}>{r.risk_level}</span>
                  <span>{r.count}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const styles = {
  title: { margin: '0 0 4px', fontSize: 28, fontWeight: 700 },
  subtitle: { margin: '0 0 24px', color: '#64748b', fontSize: 15 },
  filters: { marginBottom: 24 },
  select: { padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 },
  card: { background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0' },
  cardTitle: { margin: '0 0 16px', fontSize: 16, fontWeight: 600 },
  txnList: { display: 'flex', flexDirection: 'column', gap: 8 },
  txnRow: { display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 16, fontSize: 14 },
  expList: { display: 'flex', flexDirection: 'column', gap: 8 },
  expRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },
  riskList: { display: 'flex', flexDirection: 'column', gap: 8 },
  riskRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14 },
  empty: { margin: 0, color: '#64748b' },
};
