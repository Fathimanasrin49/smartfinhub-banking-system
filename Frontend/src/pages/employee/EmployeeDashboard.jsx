import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/useAuth';
import { employeeApi } from '../../services/employeeApi';
import { emp } from '../../styles/employeeTheme';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [txns, setTxns] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [dashRes, txnRes] = await Promise.all([
          employeeApi.getDashboard(),
          employeeApi.getTransactions({ limit: 10 }),
        ]);
        if (dashRes.success) setData(dashRes.data);
        if (txnRes.success) setTxns(txnRes.data);
      } catch (e) {
        setError(e.response?.data?.message || e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const stats = data?.stats || {};
  const employee = data?.employee || user;
  const formatAmount = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);
  const formatDate = (d) => new Date(d).toLocaleString('en-IN');

  if (loading) {
    return (
      <motion.div style={emp.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={emp.loading}>Loading...</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={emp.pageWrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <section style={emp.hero}>
        <h1 style={emp.heroTitle}>Dashboard</h1>
        <p style={emp.heroSubtitle}>
          Welcome, {employee?.name}. Overview of today&apos;s activity and pending tasks.
        </p>
      </section>

      {error && (
        <div style={{ ...emp.alert, ...emp.alertError }}>{error}</div>
      )}

      <section style={emp.section}>
        <div style={{ ...emp.statGrid, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          <motion.div style={emp.statCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div style={emp.statLabel}>Daily Transactions</div>
            <div style={{ ...emp.statValue, color: '#0d9488' }}>{stats.dailyTransactions?.count ?? 0}</div>
            <div style={emp.statSub}>{formatAmount(stats.dailyTransactions?.total)}</div>
          </motion.div>
          <motion.div style={emp.statCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div style={emp.statLabel}>Pending Approvals</div>
            <div style={{ ...emp.statValue, color: '#d97706' }}>{stats.pendingApprovals ?? 0}</div>
            <div style={emp.statSub}>Deposits & withdrawals</div>
          </motion.div>
          <motion.div style={emp.statCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <div style={emp.statLabel}>Fraud Alerts</div>
            <div style={{ ...emp.statValue, color: '#dc2626' }}>{stats.fraudAlerts ?? 0}</div>
            <div style={emp.statSub}>Last 7 days</div>
          </motion.div>
          <motion.div style={emp.statCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div style={emp.statLabel}>Queue Waiting</div>
            <div style={{ ...emp.statValue, color: '#0284c7' }}>{stats.queueWaiting ?? 0}</div>
            <div style={emp.statSub}>Branch queue</div>
          </motion.div>
          <motion.div style={emp.statCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <div style={emp.statLabel}>Service Requests</div>
            <div style={emp.statValue}>{stats.openServiceRequests ?? 0}</div>
            <div style={emp.statSub}>Open</div>
          </motion.div>
          <motion.div style={emp.statCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div style={emp.statLabel}>Open Disputes</div>
            <div style={{ ...emp.statValue, color: '#dc2626' }}>{stats.openDisputes ?? 0}</div>
            <div style={emp.statSub}>To resolve</div>
          </motion.div>
        </div>
      </section>

      <section style={emp.section}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, alignItems: 'stretch' }}>
          <motion.div style={{ ...emp.card, flex: '1 1 400px', minWidth: 0 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <h2 style={{ ...emp.sectionTitle, margin: 0, padding: '20px 20px 0' }}>Recent Transactions</h2>
            <div style={emp.tableWrap}>
              <table style={emp.table}>
                <thead>
                  <tr>
                    <th style={emp.th}>Date</th>
                    <th style={emp.th}>Type</th>
                    <th style={emp.th}>From / To</th>
                    <th style={{ ...emp.th, textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {txns.length === 0 ? (
                    <tr><td colSpan={4} style={emp.empty}>No transactions</td></tr>
                  ) : (
                    txns.map((t) => (
                      <tr key={t.id}>
                        <td style={emp.td}>{formatDate(t.created_at)}</td>
                        <td style={emp.td}>
                          <span style={{ ...emp.badge, ...(t.type === 'credit' ? emp.badgeSuccess : { background: '#f1f5f9', color: '#475569' }) }}>
                            {t.type}
                          </span>
                        </td>
                        <td style={emp.td}>{t.type === 'credit' ? t.receiver_account : t.sender_account || '—'}</td>
                        <td style={{ ...emp.td, textAlign: 'right', color: t.type === 'credit' ? '#059669' : '#334155', fontWeight: 600 }}>
                          {t.type === 'credit' ? '+' : '-'}{formatAmount(t.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
          <motion.div style={{ ...emp.card, flex: '0 1 360px', minWidth: 280 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <h2 style={{ ...emp.sectionTitle, margin: 0, padding: '20px 20px 0' }}>Alerts & Notifications</h2>
            <div style={{ padding: 20 }}>
              {(stats.pendingApprovals ?? 0) > 0 && (
                <div style={{ ...emp.alert, ...emp.alertWarning, marginBottom: 12 }}>
                  {stats.pendingApprovals} pending approval(s) need your attention.
                </div>
              )}
              {(stats.queueWaiting ?? 0) > 0 && (
                <div style={{ ...emp.alert, background: '#e0f2fe', color: '#0284c7', marginBottom: 12 }}>{stats.queueWaiting} customer(s) waiting in queue.</div>
              )}
              {(stats.openDisputes ?? 0) > 0 && (
                <div style={{ ...emp.alert, ...emp.alertError, marginBottom: 12 }}>{stats.openDisputes} open dispute(s) to resolve.</div>
              )}
              {(stats.openServiceRequests ?? 0) > 0 && (
                <div style={{ ...emp.alert, background: '#e0f2fe', color: '#0284c7', marginBottom: 12 }}>{stats.openServiceRequests} service request(s) open.</div>
              )}
              {!stats.pendingApprovals && !stats.queueWaiting && !stats.openDisputes && !stats.openServiceRequests && (
                <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>No pending alerts.</p>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
}
