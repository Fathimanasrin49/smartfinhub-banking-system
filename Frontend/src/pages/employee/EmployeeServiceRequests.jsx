import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { employeeApi } from '../../services/employeeApi';
import { emp } from '../../styles/employeeTheme';

export default function EmployeeServiceRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(null);
  const [resolveOpen, setResolveOpen] = useState(null);
  const [notes, setNotes] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await employeeApi.getServiceRequests();
      if (res.success) setRequests(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAssign = async (id) => {
    setActing(id);
    setError('');
    try {
      const res = await employeeApi.assignServiceRequest(id);
      if (res.success) load();
    } catch (e) {
      setError(e.response?.data?.message || 'Failed');
    } finally {
      setActing(null);
    }
  };

  const handleResolve = async () => {
    if (!resolveOpen) return;
    setActing(resolveOpen.id);
    setError('');
    try {
      const res = await employeeApi.resolveServiceRequest(resolveOpen.id, notes);
      if (res.success) { setResolveOpen(null); setNotes(''); load(); }
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
        <h1 style={emp.heroTitle}>Service Requests</h1>
        <p style={emp.heroSubtitle}>Handle customer service requests and feedback.</p>
      </section>
      {error && <div style={{ ...emp.alert, ...emp.alertError }}>{error}</div>}
      <section style={emp.section}>
        <motion.div style={emp.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={emp.tableWrap}>
            <table style={emp.table}>
              <thead>
                <tr>
                  <th style={emp.th}>Date</th>
                  <th style={emp.th}>Customer</th>
                  <th style={emp.th}>Subject</th>
                  <th style={emp.th}>Description</th>
                  <th style={emp.th}>Status</th>
                  <th style={{ ...emp.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={6} style={emp.loading}>Loading...</td></tr> :
                  requests.length === 0 ? <tr><td colSpan={6} style={emp.empty}>No service requests</td></tr> :
                  requests.map((r) => (
                    <tr key={r.id}>
                      <td style={emp.td}>{formatDate(r.created_at)}</td>
                      <td style={emp.td}>{r.customer_name}</td>
                      <td style={emp.td}>{r.subject}</td>
                      <td style={{ ...emp.td, maxWidth: 200 }}>{r.description || '-'}</td>
                      <td style={emp.td}><span style={{ ...emp.badge, ...(r.status === 'resolved' ? emp.badgeSuccess : r.status === 'in_progress' ? emp.badgeInfo : emp.badgeWarning) }}>{r.status}</span></td>
                      <td style={{ ...emp.td, textAlign: 'right' }}>
                        {r.status === 'open' && <motion.button type="button" style={{ ...emp.btnSecondary, marginRight: 8 }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleAssign(r.id)} disabled={acting === r.id}>Assign</motion.button>}
                        {(r.status === 'open' || r.status === 'in_progress') && <motion.button type="button" style={emp.btnPrimary} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setResolveOpen(r)} disabled={acting === r.id}>Resolve</motion.button>}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>
      {resolveOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 440, width: '90%' }}>
            <h3 style={{ margin: '0 0 16px' }}>Resolve Service Request</h3>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Resolution notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ ...emp.input, width: '100%', marginBottom: 20, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" style={emp.btnSecondary} onClick={() => setResolveOpen(null)}>Cancel</button>
              <button type="button" style={emp.btnPrimary} onClick={handleResolve} disabled={acting}>Resolve</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
