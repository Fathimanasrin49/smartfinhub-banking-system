import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/adminApi';

const riskColors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444', critical: '#7f1d1d' };

export default function AdminSuspicious() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getSuspicious().then((r) => r.success && setAlerts(r.data || [])).finally(() => setLoading(false));
  }, []);

  const formatDate = (d) => new Date(d).toLocaleString();

  if (loading) return <p>Loading...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={styles.title}>Suspicious Activities</h1>
      <p style={styles.subtitle}>AI-detected fraud alerts and risk reports</p>

      <div style={styles.list}>
        {alerts.length === 0 ? (
          <p style={styles.empty}>No alerts</p>
        ) : (
          alerts.map((a) => (
            <div key={a.id} style={{ ...styles.card, borderLeftColor: riskColors[a.risk_level] || '#64748b' }}>
              <div style={styles.cardHead}>
                <span style={{ ...styles.badge, background: riskColors[a.risk_level] || '#64748b', color: '#fff' }}>{a.risk_level}</span>
                <span style={styles.date}>{formatDate(a.created_at)}</span>
              </div>
              <p style={styles.msg}>{a.message}</p>
              <p style={styles.cust}>Account: {a.account_number} — {a.customer_name}</p>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

const styles = {
  title: { margin: '0 0 4px', fontSize: 28, fontWeight: 700 },
  subtitle: { margin: '0 0 24px', color: '#64748b', fontSize: 15 },
  list: { display: 'flex', flexDirection: 'column', gap: 12 },
  card: { background: '#fff', borderRadius: 12, padding: 20, border: '1px solid #e2e8f0', borderLeftWidth: 4 },
  cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  badge: { padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 },
  date: { fontSize: 12, color: '#64748b' },
  msg: { margin: '0 0 4px', fontSize: 15 },
  cust: { margin: 0, fontSize: 13, color: '#64748b' },
  empty: { padding: 40, textAlign: 'center', color: '#64748b' },
};
