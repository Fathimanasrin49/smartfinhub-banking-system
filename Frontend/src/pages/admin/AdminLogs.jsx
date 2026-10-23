import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/adminApi';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(100);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    adminApi
      .getLogs(limit)
      .then((r) => {
        if (r.success) setLogs(r.data || []);
        else {
          setLogs([]);
          setError(r.message || 'Failed to load logs');
        }
      })
      .catch((e) => {
        setLogs([]);
        setError(e.response?.data?.message || 'Failed to load logs');
      })
      .finally(() => setLoading(false));
  }, [limit]);

  const formatDate = (d) => new Date(d).toLocaleString('en-IN');
  const formatDetails = (details) => {
    if (!details) return '—';
    if (typeof details !== 'string') return JSON.stringify(details);
    try {
      const parsed = JSON.parse(details);
      return JSON.stringify(parsed);
    } catch {
      return details;
    }
  };

  return (
    <motion.div style={styles.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={styles.title}>Audit Logs</h1>
      <p style={styles.subtitle}>System logs and audit trails</p>

      <div style={styles.filters}>
        <label style={styles.filterLabel}>Show: </label>
        <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value, 10))} style={styles.select}>
          <option value={50}>50</option>
          <option value={100}>100</option>
          <option value={200}>200</option>
        </select>
      </div>

      {error && <div style={styles.alertError}>{error}</div>}

      <div style={styles.tableWrap}>
        {loading ? (
          <p style={styles.loading}>Loading logs...</p>
        ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Time</th>
              <th style={styles.th}>Admin</th>
              <th style={styles.th}>Action</th>
              <th style={styles.th}>Entity</th>
              <th style={styles.th}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td style={styles.date}>{formatDate(l.created_at)}</td>
                <td style={styles.td}>{l.admin_name || '—'}</td>
                <td style={styles.td}>{l.action || '—'}</td>
                <td style={styles.td}>{l.entity || '—'} {l.entity_id ? `#${l.entity_id}` : ''}</td>
                <td style={styles.details}>{formatDetails(l.details)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
        {!loading && logs.length === 0 && (
          <div style={styles.emptyBox}>
            <p style={styles.emptyTitle}>No audit logs yet</p>
            <p style={styles.empty}>
              Logs will appear after admin actions (login, updates, approvals, etc.).
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

const styles = {
  pageWrap: { minHeight: '100vh' },
  title: { margin: '0 0 4px', fontSize: 28, fontWeight: 700 },
  subtitle: { margin: '0 0 24px', color: '#64748b', fontSize: 15 },
  filters: { marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
  filterLabel: { color: '#334155', fontWeight: 500 },
  select: { padding: 8, borderRadius: 8, border: '1px solid #e2e8f0' },
  alertError: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    background: '#fee2e2',
    color: '#dc2626',
    fontSize: 14,
  },
  tableWrap: { background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left',
    padding: '14px 16px',
    background: '#f8fafc',
    color: '#475569',
    fontWeight: 600,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #e2e8f0',
  },
  td: { padding: '14px 16px', borderBottom: '1px solid #e2e8f0', color: '#334155' },
  date: { padding: '14px 16px', borderBottom: '1px solid #e2e8f0', fontSize: 13, color: '#64748b', whiteSpace: 'nowrap' },
  details: { padding: '14px 16px', borderBottom: '1px solid #e2e8f0', maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#334155' },
  loading: { padding: 40, textAlign: 'center', color: '#64748b' },
  emptyBox: { padding: 40, textAlign: 'center' },
  emptyTitle: { margin: '0 0 8px', color: '#334155', fontWeight: 700, fontSize: 16 },
  empty: { margin: 0, textAlign: 'center', color: '#64748b' },
};
