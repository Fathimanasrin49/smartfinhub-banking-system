import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { employeeApi } from '../../services/employeeApi';
import { emp } from '../../styles/employeeTheme';

export default function EmployeeDisputes() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');
  const [resolveOpen, setResolveOpen] = useState(null);
  const [notes, setNotes] = useState('');
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await employeeApi.getDisputes(filter || undefined);
      if (res.success) setDisputes(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const handleResolve = async (id, status) => {
    setActing(true);
    setError('');
    try {
      const res = await employeeApi.resolveDispute(id, status, notes);
      if (res.success) { setResolveOpen(null); setNotes(''); load(); }
      else setError(res.message || 'Failed');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed');
    } finally {
      setActing(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const stats = {
    total: disputes.length,
    open: disputes.filter(d => d.status === 'open').length,
    resolved: disputes.filter(d => d.status === 'resolved').length
  };

  return (
    <motion.div style={emp.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section style={emp.hero}>
        <h1 style={emp.heroTitle}>Disputes Management</h1>
        <p style={emp.heroSubtitle}>Monitor and resolve customer transaction disputes efficiently.</p>
      </section>

      {error && <div style={{ ...emp.alert, ...emp.alertError }}>{error}</div>}

      <div style={localStyles.statsGrid}>
        <motion.div style={localStyles.statCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <span style={localStyles.statLabel}>Total Disputes</span>
          <span style={localStyles.statValue}>{stats.total}</span>
        </motion.div>
        <motion.div style={{ ...localStyles.statCard, borderLeft: '4px solid #f59e0b' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <span style={localStyles.statLabel}>Open Cases</span>
          <span style={{ ...localStyles.statValue, color: '#f59e0b' }}>{stats.open}</span>
        </motion.div>
        <motion.div style={{ ...localStyles.statCard, borderLeft: '4px solid #10b981' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <span style={localStyles.statLabel}>Resolved</span>
          <span style={{ ...localStyles.statValue, color: '#10b981' }}>{stats.resolved}</span>
        </motion.div>
      </div>

      <section style={emp.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ display: 'flex', gap: 10 }}>
            {['', 'open', 'resolved'].map((f) => (
              <button
                key={f || 'all'}
                type="button"
                style={filter === f ? emp.btnPrimary : emp.btnSecondary}
                onClick={() => setFilter(f)}
              >
                {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All Requests'}
              </button>
            ))}
          </div>
          <button style={emp.btnSecondary} onClick={load}>↻ Refresh</button>
        </div>

        <motion.div style={emp.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={emp.tableWrap}>
            <table style={emp.table}>
              <thead>
                <tr>
                  <th style={emp.th}>Date & Time</th>
                  <th style={emp.th}>Customer Details</th>
                  <th style={emp.th}>Transaction ID</th>
                  <th style={emp.th}>Dispute Reason</th>
                  <th style={emp.th}>Status</th>
                  <th style={{ ...emp.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={emp.loading}>Fetching dispute data...</td></tr>
                ) : disputes.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ ...emp.empty, padding: '80px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 40 }}>📁</span>
                        <p style={{ margin: 0, fontWeight: 500, color: '#64748b' }}>No disputes found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  disputes.map((d, i) => (
                    <motion.tr 
                      key={d.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <td style={emp.td}>{formatDate(d.created_at)}</td>
                      <td style={emp.td}>
                        <div style={{ fontWeight: 600 }}>{d.customer_name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{d.account_number}</div>
                      </td>
                      <td style={emp.td}>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{d.txn_id || 'N/A'}</code>
                      </td>
                      <td style={{ ...emp.td, maxWidth: 250, fontSize: 13, lineHeight: 1.5 }}>{d.reason || 'No reason provided'}</td>
                      <td style={emp.td}>
                        <span style={{ 
                          ...emp.badge, 
                          ...(d.status === 'resolved' ? emp.badgeSuccess : d.status === 'rejected' ? emp.badgeError : emp.badgeWarning),
                          textTransform: 'capitalize'
                        }}>
                          {d.status}
                        </span>
                      </td>
                      <td style={{ ...emp.td, textAlign: 'right' }}>
                        {d.status === 'open' ? (
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button type="button" style={{ ...emp.btnPrimary, fontSize: 13, padding: '6px 12px' }} onClick={() => setResolveOpen({ id: d.id, action: 'resolved' })}>Resolve</button>
                            <button type="button" style={{ ...emp.btnDanger, fontSize: 13, padding: '6px 12px' }} onClick={() => setResolveOpen({ id: d.id, action: 'rejected' })}>Reject</button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>Processed</span>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {resolveOpen && (
        <div style={localStyles.modalOverlay}>
          <motion.div style={localStyles.modal} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 20 }}>{resolveOpen.action === 'resolved' ? 'Resolve Dispute' : 'Reject Dispute'}</h3>
            <p style={{ margin: '0 0 24px', color: '#64748b', fontSize: 14 }}>
              Providing detailed notes helps the customer understand the outcome.
            </p>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, fontSize: 13 }}>Resolution Notes</label>
            <textarea 
              placeholder="Explain the findings and actions taken..."
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              rows={4} 
              style={{ ...emp.input, width: '100%', marginBottom: 24, boxSizing: 'border-box', resize: 'none' }} 
            />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" style={emp.btnSecondary} onClick={() => setResolveOpen(null)}>Cancel</button>
              <button 
                type="button" 
                style={resolveOpen.action === 'resolved' ? emp.btnPrimary : emp.btnDanger} 
                onClick={() => handleResolve(resolveOpen.id, resolveOpen.action)} 
                disabled={acting}
              >
                {acting ? 'Processing...' : resolveOpen.action === 'resolved' ? 'Confirm Resolution' : 'Confirm Rejection'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

const localStyles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 20,
    maxWidth: 1200,
    margin: '0 auto 32px auto',
    padding: '0 20px'
  },
  statCard: {
    background: '#fff',
    padding: '24px',
    borderRadius: 16,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    borderLeft: '4px solid #3b82f6'
  },
  statLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.025em'
  },
  statValue: {
    fontSize: 32,
    fontWeight: 800,
    color: '#1e293b'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20
  },
  modal: {
    background: '#fff',
    borderRadius: 24,
    padding: 32,
    maxWidth: 480,
    width: '100%',
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
  }
};
