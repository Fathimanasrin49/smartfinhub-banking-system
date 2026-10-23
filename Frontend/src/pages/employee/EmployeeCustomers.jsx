import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { employeeApi } from '../../services/employeeApi';
import { emp } from '../../styles/employeeTheme';

const initialForm = { name: '', email: '', phone: '', address: '', password: '', kyc_status: 'pending' };

export default function EmployeeCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await employeeApi.getCustomers({ search: search || undefined, limit: 100 });
      if (res.success) setCustomers(res.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const res = await employeeApi.createCustomer(form);
      if (res.success) {
        setSuccess(`Customer added. Account: ${res.data?.account_number || '—'}`);
        setAddOpen(false);
        setForm(initialForm);
        load();
      } else {
        setError(res.message || 'Failed to add customer');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to add customer');
    } finally {
      setSubmitting(false);
    }
  };

  const formatAmount = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);

  return (
    <motion.div style={emp.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section style={emp.hero}>
        <h1 style={emp.heroTitle}>Customers</h1>
        <p style={emp.heroSubtitle}>View and manage customer accounts. Add new customers with a bank account.</p>
      </section>

      <section style={emp.section}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 20 }}>
          <input
            type="text"
            placeholder="Search by name, email, account number"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...emp.input, minWidth: 280 }}
          />
          <motion.button
            type="button"
            style={emp.btnPrimary}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setAddOpen(true); setError(''); setSuccess(''); setForm(initialForm); }}
          >
            + Add Customer (New Account)
          </motion.button>
        </div>

        {error && <div style={{ ...emp.alert, ...emp.alertError }}>{error}</div>}
        {success && <div style={{ ...emp.alert, ...emp.alertSuccess }}>{success}</div>}

        <motion.div style={emp.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={emp.tableWrap}>
            <table style={emp.table}>
              <thead>
                <tr>
                  <th style={emp.th}>Account</th>
                  <th style={emp.th}>Name</th>
                  <th style={emp.th}>Email</th>
                  <th style={{ ...emp.th, textAlign: 'right' }}>Balance</th>
                  <th style={emp.th}>KYC</th>
                  <th style={emp.th}>Status</th>
                  <th style={{ ...emp.th, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={emp.loading}>Loading...</td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan={7} style={emp.empty}>No customers found</td></tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id}>
                      <td style={emp.td}>{c.account_number}</td>
                      <td style={emp.td}>{c.name}</td>
                      <td style={emp.td}>{c.email}</td>
                      <td style={{ ...emp.td, textAlign: 'right' }}>{formatAmount(c.balance)}</td>
                      <td style={emp.td}>
                        <span style={{ ...emp.badge, ...(c.kyc_status === 'verified' ? emp.badgeSuccess : c.kyc_status === 'rejected' ? emp.badgeError : { background: '#f1f5f9', color: '#64748b' }) }}>{c.kyc_status}</span>
                      </td>
                      <td style={emp.td}>
                        <span style={{ ...emp.badge, ...(c.status === 'active' ? emp.badgeSuccess : { background: '#f1f5f9', color: '#64748b' }) }}>{c.status}</span>
                      </td>
                      <td style={{ ...emp.td, textAlign: 'right' }}>
                        <button type="button" style={{ ...emp.btnSecondary, padding: '6px 14px', fontSize: 13 }} onClick={() => navigate('/employee/customers/' + c.id)}>View</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      {addOpen && (
        <div style={modalOverlay} onClick={() => !submitting && setAddOpen(false)}>
          <motion.div
            style={modalBox}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={modalTitle}>Add Customer (New Account)</h2>
            <p style={modalSubtitle}>A new account number will be generated automatically.</p>
            <form onSubmit={handleAddCustomer}>
              <label style={labelStyle}>Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                style={inputFull}
                placeholder="Full name"
              />
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                style={inputFull}
                placeholder="email@example.com"
              />
              <label style={labelStyle}>Phone *</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                style={inputFull}
                placeholder="10-digit mobile"
              />
              <label style={labelStyle}>Address</label>
              <textarea
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                rows={2}
                style={{ ...inputFull, resize: 'vertical' }}
                placeholder="Address (optional)"
              />
              <label style={labelStyle}>Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                style={inputFull}
                placeholder="Min 6 characters"
              />
              <label style={labelStyle}>KYC status</label>
              <select
                value={form.kyc_status}
                onChange={(e) => setForm((f) => ({ ...f, kyc_status: e.target.value }))}
                style={inputFull}
              >
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
              <div style={modalActions}>
                <button type="button" style={emp.btnSecondary} onClick={() => !submitting && setAddOpen(false)}>Cancel</button>
                <button type="submit" style={emp.btnPrimary} disabled={submitting}>{submitting ? 'Adding...' : 'Add Customer'}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

const modalOverlay = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 20,
};
const modalBox = {
  background: '#fff',
  borderRadius: 16,
  padding: 28,
  maxWidth: 440,
  width: '100%',
  border: '1px solid #e2e8f0',
  boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
};
const modalTitle = { margin: 0, fontSize: 20, fontWeight: 700, color: '#1e293b' };
const modalSubtitle = { margin: '6px 0 20px', fontSize: 14, color: '#64748b' };
const labelStyle = { display: 'block', marginBottom: 6, fontSize: 14, fontWeight: 600, color: '#334155' };
const inputFull = { ...emp.input, width: '100%', marginBottom: 16, boxSizing: 'border-box' };
const modalActions = { display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 };
