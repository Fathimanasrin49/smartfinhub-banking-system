import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/adminApi';

const formatBal = (n) => `₹${parseFloat(n || 0).toLocaleString('en-IN')}`;

function badgeKyc(status) {
  if (status === 'verified') return { background: '#d1fae5', color: '#059669' };
  if (status === 'rejected') return { background: '#fee2e2', color: '#dc2626' };
  return { background: '#fef3c7', color: '#d97706' };
}

function badgeStatus(status) {
  if (status === 'active') return { background: '#d1fae5', color: '#059669' };
  if (status === 'blocked') return { background: '#fee2e2', color: '#dc2626' };
  return { background: '#f1f5f9', color: '#64748b' };
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const load = () => adminApi.getCustomers().then((r) => r.success && setCustomers(r.data || []));

  useEffect(() => {
    setLoading(true);
    setError('');
    adminApi.getCustomers()
      .then((r) => { if (r.success) setCustomers(r.data || []); else setError(r.message || 'Failed to load'); })
      .catch(() => setError('Failed to load customers'))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id) => {
    const c = customers.find((x) => x.id === id);
    if (!c) return;
    setError('');
    try {
      await adminApi.updateCustomer(id, { status: c.status, kycStatus: c.kyc_status });
      setEditing(null);
      load();
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed');
    }
  };

  return (
    <motion.div style={styles.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Customer Directory</h1>
        <p style={styles.heroSubtitle}>Overview of all account holders, their verification status and balances.</p>
      </section>

      {error && <div style={styles.alertError}><span>⚠️</span> {error}</div>}

      <section style={styles.section}>
        <motion.div style={styles.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={styles.tableWrap}>
            {loading ? (
              <div style={styles.loading}>
                <div style={styles.spinner} />
                <p>Retrieving customer records...</p>
              </div>
            ) : customers.length === 0 ? (
              <div style={styles.empty}>No registered customers found.</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Account Number</th>
                    <th style={styles.th}>Customer Name</th>
                    <th style={styles.th}>Email Address</th>
                    <th style={styles.th}>Contact Number</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Balance</th>
                    <th style={styles.th}>KYC Status</th>
                    <th style={styles.th}>Account Status</th>
                    <th style={{ ...styles.th, textAlign: 'right', minWidth: 140 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c, idx) => (
                    <motion.tr 
                      key={c.id} 
                      style={styles.tr}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td style={styles.td}><span style={styles.accountNumber}>{c.account_number}</span></td>
                      <td style={styles.td}><span style={styles.custName}>{c.name}</span></td>
                      <td style={styles.td}>{c.email}</td>
                      <td style={styles.td}><span style={styles.phoneLabel}>{c.phone || '—'}</span></td>
                      <td style={{ ...styles.td, textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>{formatBal(c.balance)}</td>
                      <td style={styles.td}>
                        {editing === c.id ? (
                          <select value={c.kyc_status} onChange={(ev) => setCustomers((prev) => prev.map((x) => (x.id === c.id ? { ...x, kyc_status: ev.target.value } : x)))} style={styles.select}>
                            <option value="pending">Pending</option>
                            <option value="verified">Verified</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        ) : (
                          <span style={{ ...styles.badge, ...badgeKyc(c.kyc_status) }}>{c.kyc_status}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {editing === c.id ? (
                          <select value={c.status} onChange={(ev) => setCustomers((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: ev.target.value } : x)))} style={styles.select}>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="blocked">Blocked</option>
                          </select>
                        ) : (
                          <span style={{ ...styles.badge, ...badgeStatus(c.status) }}>{c.status}</span>
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        {editing === c.id ? (
                          <span style={styles.btnGroup}>
                            <button type="button" onClick={() => handleUpdate(c.id)} style={styles.btnSave}>Save</button>
                            <button type="button" onClick={() => setEditing(null)} style={styles.btnCancel}>Cancel</button>
                          </span>
                        ) : (
                          <button type="button" onClick={() => setEditing(c.id)} style={styles.btnEdit}>Manage</button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}

const styles = {
  pageWrap: { minHeight: '100vh', padding: '40px 20px', backgroundColor: '#f8fafc' },
  hero: { marginBottom: 40, textAlign: 'center' },
  heroTitle: { margin: 0, fontSize: 32, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' },
  heroSubtitle: { margin: '8px 0 0', fontSize: 16, color: '#64748b' },
  section: { maxWidth: 1400, margin: '0 auto' },
  card: { background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: { textAlign: 'left', padding: '16px 20px', background: '#f8fafc', color: '#64748b', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #e2e8f0' },
  tr: { transition: 'background-color 0.2s' },
  td: { padding: '16px 20px', borderBottom: '1px solid #f1f5f9', color: '#334155', verticalAlign: 'middle' },
  custName: { fontWeight: 700, color: '#1e293b' },
  phoneLabel: { color: '#0f766e', fontWeight: 600, fontSize: 13, background: '#f0fdfa', padding: '2px 8px', borderRadius: 4 },
  accountNumber: { fontFamily: 'monospace', fontWeight: 600, color: '#0d9488', letterSpacing: '0.5px' },
  badge: { display: 'inline-block', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' },
  select: { padding: '8px 12px', borderRadius: 8, border: '2px solid #e2e8f0', fontSize: 14, minWidth: 120, outline: 'none' },
  btnGroup: { display: 'inline-flex', gap: 8 },
  btnEdit: { padding: '8px 16px', background: '#fff', color: '#334155', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
  btnSave: { padding: '8px 16px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  btnCancel: { padding: '8px 16px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  loading: { padding: 80, textAlign: 'center', color: '#64748b' },
  spinner: { width: 32, height: 32, border: '3px solid #f3f3f3', borderTop: '3px solid #0d9488', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' },
  empty: { padding: 80, textAlign: 'center', color: '#94a3b8' },
  alertError: { maxWidth: 1400, margin: '0 auto 24px', padding: '12px 20px', background: '#fef2f2', color: '#b91c1c', borderRadius: 12, fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 10 },
};
