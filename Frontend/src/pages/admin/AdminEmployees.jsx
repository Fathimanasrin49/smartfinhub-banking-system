import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/adminApi';

export default function AdminEmployees() {
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      const [r1, r2] = await Promise.all([adminApi.getEmployees(), adminApi.getBranches()]);
      if (r1.success) setEmployees(r1.data || []);
      if (r2.success) setBranches(r2.data || []);
    } catch (e) {
      setError('Failed to refresh data');
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    load().finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (id) => {
    const emp = employees.find((e) => e.id === id);
    if (!emp) return;
    setActing(true);
    setError('');
    try {
      const res = await adminApi.updateEmployee(id, {
        name: emp.name,
        email: emp.email,
        phone: emp.phone || '',
        role: emp.role,
        status: emp.status,
        branchId: emp.branch_id,
      });
      if (res.success) {
        setEditing(null);
        await load();
      } else {
        setError(res.message || 'Update failed');
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Update failed. Check connection.');
    } finally {
      setActing(false);
    }
  };

  const roleOptions = ['Teller', 'Cashier', 'Branch Manager', 'Relationship Manager', 'Support Staff'];

  const handleFieldChange = (id, field, value) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  return (
    <motion.div style={styles.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Employee Directory</h1>
        <p style={styles.heroSubtitle}>Assign branches, manage roles, and monitor employee status.</p>
      </section>

      {error && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={styles.alertError}>
          <span>⚠️</span> {error}
        </motion.div>
      )}

      <section style={styles.section}>
        <motion.div style={styles.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {loading ? (
            <div style={styles.loading}>
              <div style={styles.spinner} />
              <p>Loading records...</p>
            </div>
          ) : employees.length === 0 ? (
            <div style={styles.empty}>No employee records found.</div>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Contact Info</th>
                    <th style={styles.th}>Role & Designation</th>
                    <th style={styles.th}>Branch Assignment</th>
                    <th style={styles.th}>Status</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((e, idx) => (
                    <motion.tr 
                      key={e.id} 
                      style={styles.tr}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td style={styles.td}>
                        <div style={styles.nameCell}>
                          {editing === e.id ? (
                            <input
                              type="text"
                              value={e.name}
                              onChange={(ev) => handleFieldChange(e.id, 'name', ev.target.value)}
                              style={styles.inlineInput}
                            />
                          ) : (
                            <span style={styles.empName}>{e.name}</span>
                          )}
                          <span style={styles.employeeId}>{e.employee_id}</span>
                        </div>
                      </td>
                      <td style={styles.td}>
                        <div style={styles.contactCell}>
                          {editing === e.id ? (
                            <>
                              <input
                                type="email"
                                value={e.email}
                                onChange={(ev) => handleFieldChange(e.id, 'email', ev.target.value)}
                                style={{ ...styles.inlineInput, marginBottom: 4 }}
                                placeholder="Email"
                              />
                              <input
                                type="tel"
                                value={e.phone || ''}
                                onChange={(ev) => handleFieldChange(e.id, 'phone', ev.target.value)}
                                style={styles.inlineInput}
                                placeholder="Phone"
                              />
                            </>
                          ) : (
                            <>
                              <span style={styles.email}>{e.email}</span>
                              <span style={styles.phone}>{e.phone || 'No phone'}</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td style={styles.td}>
                        {editing === e.id ? (
                          <select
                            value={e.role}
                            onChange={(ev) => handleFieldChange(e.id, 'role', ev.target.value)}
                            style={styles.select}
                          >
                            {roleOptions.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={styles.roleLabel}>{e.role}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {editing === e.id ? (
                          <select
                            value={e.branch_id || ''}
                            onChange={(ev) => handleFieldChange(e.id, 'branch_id', ev.target.value ? parseInt(ev.target.value, 10) : null)}
                            style={styles.select}
                          >
                            <option value="">Select Branch</option>
                            {branches.map((b) => (
                              <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={styles.branchName}>{e.branch_name || 'Unassigned'}</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        {editing === e.id ? (
                          <select
                            value={e.status}
                            onChange={(ev) => handleFieldChange(e.id, 'status', ev.target.value)}
                            style={styles.select}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <span style={{ 
                            ...styles.badge, 
                            ...(e.status === 'active' ? styles.badgeActive : styles.badgeInactive) 
                          }}>
                            {e.status}
                          </span>
                        )}
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        {editing === e.id ? (
                          <div style={styles.btnGroup}>
                            <button 
                              type="button" 
                              onClick={() => handleUpdate(e.id)} 
                              style={styles.btnSave}
                              disabled={acting}
                            >
                              {acting ? 'Saving...' : 'Save'}
                            </button>
                            <button 
                              type="button" 
                              onClick={() => setEditing(null)} 
                              style={styles.btnCancel}
                              disabled={acting}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => setEditing(e.id)} style={styles.btnEdit}>
                            Edit Details
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
  section: { maxWidth: 1200, margin: '0 auto' },
  card: {
    background: '#fff',
    borderRadius: 24,
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  tableWrap: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  th: {
    textAlign: 'left',
    padding: '16px 20px',
    background: '#f8fafc',
    color: '#64748b',
    fontWeight: 700,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #e2e8f0',
  },
  td: {
    padding: '16px 20px',
    borderBottom: '1px solid #f1f5f9',
    color: '#334155',
    verticalAlign: 'middle',
  },
  nameCell: { display: 'flex', flexDirection: 'column', gap: 4 },
  empName: { fontWeight: 700, color: '#1e293b', fontSize: 15 },
  employeeId: { fontSize: 13, background: '#f1f5f9', color: '#0d9488', padding: '2px 8px', borderRadius: 4, width: 'fit-content', fontWeight: 600 },
  contactCell: { display: 'flex', flexDirection: 'column', gap: 2 },
  email: { fontSize: 14, color: '#334155' },
  phone: { fontSize: 13, color: '#64748b' },
  roleLabel: { fontWeight: 600, color: '#0f172a' },
  branchName: { color: '#444' },
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: 8,
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  badgeActive: { backgroundColor: '#d1fae5', color: '#065f46' },
  badgeInactive: { backgroundColor: '#f1f5f9', color: '#475569' },
  inlineInput: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '2px solid #e2e8f0',
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  select: {
    padding: '8px 12px',
    borderRadius: 8,
    border: '2px solid #e2e8f0',
    fontSize: 14,
    width: '100%',
    minWidth: 160,
    outline: 'none',
  },
  btnGroup: { display: 'flex', gap: 8, justifyContent: 'flex-end' },
  btnEdit: {
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#334155',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  btnSave: {
    padding: '8px 16px',
    background: '#0d9488',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnCancel: {
    padding: '8px 16px',
    background: '#f1f5f9',
    color: '#475569',
    border: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  loading: { padding: 80, textAlign: 'center', color: '#64748b' },
  spinner: {
    width: 32,
    height: 32,
    border: '3px solid #f3f3f3',
    borderTop: '3px solid #0d9488',
    borderRadius: '50%',
    margin: '0 auto 16px',
    animation: 'spin 1s linear infinite',
  },
  empty: { padding: 80, textAlign: 'center', color: '#94a3b8' },
  alertError: {
    maxWidth: 1200,
    margin: '0 auto 24px',
    padding: '12px 20px',
    background: '#fef2f2',
    color: '#b91c1c',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
};
