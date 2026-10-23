import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { employeeApi } from '../../services/employeeApi';
import { emp } from '../../styles/employeeTheme';

export default function EmployeeQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(null);
  const [statusFilter, setStatusFilter] = useState('waiting');
  const [success, setSuccess] = useState('');
  const [info, setInfo] = useState('');

  const load = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError('');
    try {
      const res = await employeeApi.getQueue(statusFilter);
      if (res.success) {
        setQueue(res.data);
        setInfo(res.scope === 'all_branches' ? (res.message || 'Showing queue for all branches.') : '');
      }
      else setError(res.message || 'Failed to fetch queue');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const timer = setInterval(() => load(false), 10000);
    return () => clearInterval(timer);
  }, [statusFilter]);

  const handleServe = async (id) => {
    setActing(id);
    setError('');
    setSuccess('');
    try {
      const res = await employeeApi.serveToken(id);
      if (res.success) {
        setSuccess('Token marked as served');
        load(false);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed');
    } finally {
      setActing(null);
    }
  };

  const handleCancel = async (id) => {
    setActing(id);
    setError('');
    setSuccess('');
    try {
      const res = await employeeApi.cancelToken(id);
      if (res.success) {
        setSuccess('Token cancelled successfully');
        load(false);
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed');
    } finally {
      setActing(null);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleString('en-IN');

  return (
    <motion.div style={emp.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section style={emp.hero}>
        <h1 style={emp.heroTitle}>Branch Queue</h1>
        <p style={emp.heroSubtitle}>Monitor and serve customers using QR tokens.</p>
      </section>
      {error && <div style={{ ...emp.alert, ...emp.alertError }}>{error}</div>}
      {info && <div style={{ ...emp.alert, ...emp.alertInfo }}>{info}</div>}
      {success && <div style={{ ...emp.alert, ...emp.alertSuccess }}>{success}</div>}
      <section style={emp.section}>
        <motion.div style={emp.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={styles.controls}>
            <label style={styles.filterLabel} htmlFor="queueStatus">Status:</label>
            <select
              id="queueStatus"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.select}
            >
              <option value="waiting">Waiting</option>
              <option value="served">Served</option>
              <option value="cancelled">Cancelled</option>
              <option value="all">All</option>
            </select>
            <button type="button" style={styles.refreshBtn} onClick={() => load(false)} disabled={loading}>
              Refresh
            </button>
          </div>
          <div style={emp.tableWrap}>
            <table style={emp.table}>
              <thead>
                <tr>
                  <th style={emp.th}>Token</th>
                  <th style={emp.th}>Customer</th>
                  <th style={emp.th}>Branch</th>
                  <th style={emp.th}>Account</th>
                  <th style={emp.th}>Status</th>
                  <th style={emp.th}>Joined</th>
                  <th style={{ ...emp.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={7} style={emp.loading}>Loading...</td></tr> :
                  queue.length === 0 ? <tr><td colSpan={7} style={emp.empty}>No tokens found</td></tr> :
                  queue.map((q) => (
                    <tr key={q.id}>
                      <td style={emp.td}><span style={{ ...emp.badge, ...emp.badgeInfo }}>{q.token_number}</span></td>
                      <td style={emp.td}>{q.customer_name}</td>
                      <td style={emp.td}>{q.branch_name || '—'}</td>
                      <td style={emp.td}>{q.account_number}</td>
                      <td style={emp.td}>
                        <span style={styles.status(q.status)}>{q.status}</span>
                      </td>
                      <td style={emp.td}>{formatDate(q.created_at)}</td>
                      <td style={{ ...emp.td, textAlign: 'right' }}>
                        {q.status === 'waiting' ? (
                          <>
                            <motion.button type="button" style={{ ...emp.btnPrimary, marginRight: 8 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleServe(q.id)} disabled={acting === q.id}>Serve</motion.button>
                            <motion.button type="button" style={emp.btnDanger} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleCancel(q.id)} disabled={acting === q.id}>Cancel</motion.button>
                          </>
                        ) : (
                          <span style={styles.doneText}>No actions</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}

const styles = {
  controls: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  filterLabel: { fontSize: 14, color: '#475569', fontWeight: 600 },
  select: { padding: '8px 10px', borderRadius: 8, border: '1px solid #cbd5e1' },
  refreshBtn: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #0d9488',
    background: '#f0fdfa',
    color: '#0f766e',
    cursor: 'pointer',
    fontWeight: 600,
  },
  doneText: { color: '#94a3b8', fontSize: 13, fontWeight: 600 },
  status: (status) => ({
    textTransform: 'capitalize',
    padding: '4px 8px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background: status === 'served' ? '#dcfce7' : status === 'cancelled' ? '#fee2e2' : '#fef3c7',
    color: status === 'served' ? '#166534' : status === 'cancelled' ? '#b91c1c' : '#92400e',
  }),
};
