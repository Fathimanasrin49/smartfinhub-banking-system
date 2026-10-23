import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { adminApi } from '../../services/adminApi';

const formatCurrency = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const formatNum = (n) => Number(n || 0).toLocaleString('en-IN');

const PulseDot = ({ color }) => (
  <span style={{ ...styles.pulseDot, background: color }} />
);

const MetricTile = ({ title, value, hint, color, to }) => {
  const body = (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      style={{ ...styles.metricTile, borderTopColor: color }}
    >
      <div style={styles.metricHead}>
        <span style={styles.metricTitle}>{title}</span>
        <PulseDot color={color} />
      </div>
      <div style={styles.metricValue}>{value}</div>
      {hint && <div style={styles.metricHint}>{hint}</div>}
    </motion.div>
  );
  if (!to) return body;
  return <Link to={to} style={styles.unstyledLink}>{body}</Link>;
};

const ActionCard = ({ to, icon, title, desc }) => (
  <Link to={to} style={styles.unstyledLink}>
    <motion.div style={styles.actionCard} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <div style={styles.actionIcon}>{icon}</div>
      <div>
        <div style={styles.actionTitle}>{title}</div>
        <div style={styles.actionDesc}>{desc}</div>
      </div>
      <div style={styles.actionArrow}>→</div>
    </motion.div>
  </Link>
);

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([adminApi.getDashboard(), adminApi.getLogs(8)])
      .then(([dRes, lRes]) => {
        if (dRes.success) setData(dRes.data);
        else setError(dRes.message || 'Failed to load dashboard');
        if (lRes.success) setLogs(lRes.data || []);
      })
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  const d = data || {};

  const healthScore = useMemo(() => {
    const pendingRisk = Number(d.pendingKyc || 0) + Number(d.openDisputes || 0);
    const score = Math.max(0, 100 - pendingRisk * 4);
    return Math.min(100, score);
  }, [d.pendingKyc, d.openDisputes]);

  if (loading) {
    return (
      <motion.div style={styles.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={styles.loadingBox}>Loading dashboard...</div>
      </motion.div>
    );
  }

  if (error && !data) {
    return (
      <motion.div style={styles.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={styles.alertError}>{error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div style={styles.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section style={styles.heroPanel}>
        <div>
          <div style={styles.heroTag}>Operations Command Center</div>
          <h1 style={styles.heroTitle}>Admin Dashboard</h1>
          <p style={styles.heroSubtitle}>Real-time snapshot of customer health, transaction activity, and governance actions.</p>
          <div style={styles.heroBadges}>
            <span style={styles.heroBadge}>Today: {formatNum(d.todayTransactions)} txns</span>
            <span style={styles.heroBadge}>Volume: {formatCurrency(d.todayVolume)}</span>
            <span style={styles.heroBadge}>Branches: {formatNum(d.totalBranches)}</span>
          </div>
        </div>
        <div style={styles.healthCard}>
          <div style={styles.healthLabel}>Operational Health</div>
          <div style={styles.healthValue}>{healthScore}%</div>
          <div style={styles.healthMeta}>
            <div style={styles.healthRow}><span>Pending KYC</span><strong>{formatNum(d.pendingKyc)}</strong></div>
            <div style={styles.healthRow}><span>Open Disputes</span><strong>{formatNum(d.openDisputes)}</strong></div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Core Metrics</h2>
        <div style={styles.metricsGrid}>
          <MetricTile title="Total Customers" value={formatNum(d.totalCustomers)} hint="active customer base" color="#0d9488" to="/admin/customers" />
          <MetricTile title="Total Employees" value={formatNum(d.totalEmployees)} hint="workforce count" color="#3b82f6" to="/admin/employees" />
          <MetricTile title="Total Balance" value={formatCurrency(d.totalDeposits)} hint="customer balances" color="#7c3aed" />
          <MetricTile title="Pending Approvals" value={formatNum(d.pendingApprovals)} hint="deposit / withdrawal requests" color="#ec4899" />
          <MetricTile title="Open Disputes" value={formatNum(d.openDisputes)} hint="requires follow-up" color="#ef4444" />
        </div>
      </section>

      <section style={styles.twoCol}>
        <div>
          <h2 style={styles.sectionTitle}>Action Hub</h2>
          <div style={styles.actionGrid}>
            <ActionCard to="/admin/customers" icon="◎" title="Manage Customers" desc="KYC, status, profile oversight" />
            <ActionCard to="/admin/employees" icon="▣" title="Manage Employees" desc="Roles, branch assignment, status" />
            <ActionCard to="/admin/analytics" icon="∑" title="Open Analytics" desc="Patterns, trends, and risk mix" />
            <ActionCard to="/admin/logs" icon="▤" title="Audit Trail" desc="Review admin activities and changes" />
          </div>
        </div>

        <div>
          <h2 style={styles.sectionTitle}>Live Ops Summary</h2>
          <div style={styles.summaryCard}>
            <div style={styles.summaryRow}>
              <span style={styles.summaryK}>Transactions Today</span>
              <span style={styles.summaryV}>{formatNum(d.todayTransactions)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryK}>Volume Today</span>
              <span style={styles.summaryV}>{formatCurrency(d.todayVolume)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryK}>Pending KYC Cases</span>
              <span style={styles.summaryV}>{formatNum(d.pendingKyc)}</span>
            </div>
            <div style={styles.summaryRow}>
              <span style={styles.summaryK}>Open Disputes</span>
              <span style={styles.summaryV}>{formatNum(d.openDisputes)}</span>
            </div>
          </div>
        </div>
      </section>

      <section style={styles.section}>
        <div style={styles.activityHeader}>
          <h2 style={styles.sectionTitle}>Recent Activity Stream</h2>
          <Link to="/admin/logs" style={styles.activityLink}>View all logs →</Link>
        </div>
        <div style={styles.activityCard}>
          {logs.length === 0 ? (
            <div style={styles.empty}>No recent audit logs.</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Time</th>
                    <th style={styles.th}>Action</th>
                    <th style={styles.th}>Entity</th>
                    <th style={styles.th}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 8).map((log) => (
                    <tr key={log.id}>
                      <td style={styles.td}>{log.created_at ? new Date(log.created_at).toLocaleString('en-IN') : '—'}</td>
                      <td style={styles.td}>{log.action || '—'}</td>
                      <td style={styles.td}>{log.entity || '—'}</td>
                      <td style={styles.td}>{log.details ? (typeof log.details === 'string' ? log.details : JSON.stringify(log.details)) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </motion.div>
  );
}

const styles = {
  pageWrap: { minHeight: '100vh' },
  unstyledLink: { textDecoration: 'none', color: 'inherit' },
  loadingBox: {
    padding: 48,
    textAlign: 'center',
    color: '#64748b',
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
  },
  alertError: { padding: 16, borderRadius: 12, background: '#fee2e2', color: '#dc2626', marginBottom: 24 },
  heroPanel: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #0f766e 140%)',
    borderRadius: 20,
    padding: 28,
    color: '#e2e8f0',
    display: 'grid',
    gridTemplateColumns: '1.5fr 320px',
    gap: 24,
    marginBottom: 28,
  },
  heroTag: {
    display: 'inline-block',
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.04em',
    marginBottom: 12,
  },
  heroTitle: { margin: 0, fontSize: 34, fontWeight: 800, color: '#fff' },
  heroSubtitle: { margin: '10px 0 0', fontSize: 15, color: '#cbd5e1', maxWidth: 640, lineHeight: 1.6 },
  heroBadges: { display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 },
  heroBadge: {
    padding: '6px 12px',
    border: '1px solid rgba(255,255,255,0.25)',
    borderRadius: 999,
    fontSize: 12,
    color: '#e2e8f0',
  },
  healthCard: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 16,
    padding: 18,
    backdropFilter: 'blur(2px)',
  },
  healthLabel: { fontSize: 12, color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 },
  healthValue: { marginTop: 6, fontSize: 34, fontWeight: 800, color: '#fff' },
  healthMeta: { marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 },
  healthRow: { display: 'flex', justifyContent: 'space-between', color: '#e2e8f0', fontSize: 13 },
  section: { marginBottom: 28 },
  sectionTitle: { margin: '0 0 14px', fontSize: 18, fontWeight: 700, color: '#334155' },
  metricsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 },
  metricTile: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #e2e8f0',
    borderTop: '4px solid #0d9488',
    padding: 16,
  },
  metricHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  metricTitle: { fontSize: 13, color: '#64748b', fontWeight: 600 },
  metricValue: { marginTop: 8, fontSize: 28, fontWeight: 800, color: '#1e293b' },
  metricHint: { marginTop: 4, fontSize: 12, color: '#94a3b8' },
  pulseDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    boxShadow: '0 0 0 4px rgba(13,148,136,0.14)',
  },
  twoCol: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 18, marginBottom: 28 },
  actionGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  actionCard: {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    padding: 14,
    display: 'grid',
    gridTemplateColumns: '34px 1fr 16px',
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    background: '#f0fdfa',
    color: '#0d9488',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
  },
  actionTitle: { fontSize: 14, fontWeight: 700, color: '#1e293b' },
  actionDesc: { marginTop: 2, fontSize: 12, color: '#64748b' },
  actionArrow: { color: '#94a3b8', fontWeight: 700 },
  summaryCard: {
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 8px',
    borderBottom: '1px solid #f1f5f9',
  },
  summaryK: { color: '#64748b', fontSize: 13 },
  summaryV: { color: '#1e293b', fontWeight: 700 },
  activityHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  activityLink: { color: '#0d9488', textDecoration: 'none', fontSize: 14, fontWeight: 600 },
  activityCard: { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', padding: '12px 14px', background: '#f8fafc', color: '#475569', fontWeight: 600, fontSize: 12, borderBottom: '2px solid #e2e8f0' },
  td: { padding: '12px 14px', borderBottom: '1px solid #e2e8f0', color: '#334155' },
  empty: { padding: 30, textAlign: 'center', color: '#64748b' },
};
