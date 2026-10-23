import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { employeeApi } from '../../services/employeeApi';
import { emp } from '../../styles/employeeTheme';

export default function EmployeeApprovals() {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await employeeApi.getApprovals();
      if (res.success) setApprovals(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    setActing(id);
    setError('');
    try {
      const res = await employeeApi.approveRequest(id);
      if (res.success) load();
      else setError(res.message || 'Failed');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to approve');
    } finally {
      setActing(null);
    }
  };

  const handleReject = async (id) => {
    setActing(id);
    setError('');
    try {
      const res = await employeeApi.rejectRequest(id, 'Rejected by employee');
      if (res.success) load();
      else setError(res.message || 'Failed');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to reject');
    } finally {
      setActing(null);
    }
  };

  const formatAmount = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);
  const formatDate = (d) => new Date(d).toLocaleString('en-IN');

  return (
    <motion.div style={emp.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section style={emp.hero}>
        <h1 style={emp.heroTitle}>Pending Approvals</h1>
        <p style={emp.heroSubtitle}>Approve or reject deposit and withdrawal requests.</p>
      </section>

      {error && (
        <div style={{ ...emp.alert, ...emp.alertError }}>{error}</div>
      )}

      <section style={emp.section}>
        <motion.div style={emp.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div style={emp.tableWrap}>
            <table style={emp.table}>
              <thead>
                <tr>
                  <th style={emp.th}>Date</th>
                  <th style={emp.th}>Type</th>
                  <th style={emp.th}>Customer</th>
                  <th style={emp.th}>Account</th>
                  <th style={{ ...emp.th, textAlign: 'right' }}>Amount</th>
                  <th style={emp.th}>Description</th>
                  <th style={{ ...emp.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={emp.loading}>Loading...</td></tr>
                ) : approvals.length === 0 ? (
                  <tr><td colSpan={7} style={emp.empty}>No pending approvals</td></tr>
                ) : (
                  approvals.map((a) => (
                    <tr key={a.id}>
                      <td style={emp.td}>{formatDate(a.created_at)}</td>
                      <td style={emp.td}>
                        <span style={{ ...emp.badge, ...(a.type === 'deposit' ? emp.badgeSuccess : emp.badgeWarning) }}>{a.type}</span>
                      </td>
                      <td style={emp.td}>{a.customer_name}</td>
                      <td style={emp.td}>{a.account_number}</td>
                      <td style={{ ...emp.td, textAlign: 'right', fontWeight: 600 }}>{formatAmount(a.amount)}</td>
                      <td style={emp.td}>{a.description || '—'}</td>
                      <td style={{ ...emp.td, textAlign: 'right' }}>
                        <button
                          type="button"
                          style={{ ...emp.btnPrimary, marginRight: 8 }}
                          onClick={() => handleApprove(a.id)}
                          disabled={acting === a.id}
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          style={emp.btnDanger}
                          onClick={() => handleReject(a.id)}
                          disabled={acting === a.id}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
}
