import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { employeeApi } from '../../services/employeeApi';
import { emp } from '../../styles/employeeTheme';

export default function EmployeeCustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(null);
  const [kycOpen, setKycOpen] = useState(false);
  const [kycAction, setKycAction] = useState('');
  const [tellerOpen, setTellerOpen] = useState(false);
  const [tellerType, setTellerType] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [sortByDate, setSortByDate] = useState('desc');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [cRes, tRes] = await Promise.all([
        employeeApi.getCustomerById(id),
        employeeApi.getCustomerTransactions(id),
      ]);
      if (cRes.success) setCustomer(cRes.data);
      if (tRes.success) setTxns(tRes.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load();
  }, [id]);

  const handleKyc = async () => {
    setActing('kyc');
    setError('');
    try {
      const res = await employeeApi.updateCustomerKyc(id, kycAction);
      if (res.success) {
        setKycOpen(false);
        setKycAction('');
        load();
      } else setError(res.message || 'Failed');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed');
    } finally {
      setActing(null);
    }
  };

  const handleTeller = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) {
      setError('Invalid amount');
      return;
    }
    setActing('teller');
    setError('');
    try {
      const res = tellerType === 'deposit'
        ? await employeeApi.branchDeposit(id, amt, description)
        : await employeeApi.branchWithdraw(id, amt, description);
      if (res.success) {
        setTellerOpen(false);
        setAmount('');
        setDescription('');
        setTellerType('');
        load();
      } else setError(res.message || 'Failed');
    } catch (e) {
      setError(e.response?.data?.message || 'Failed');
    } finally {
      setActing(null);
    }
  };

  const formatAmount = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);
  const formatDate = (d) => new Date(d).toLocaleString('en-IN');

  const sortedTxns = useMemo(() => {
    if (!txns.length) return [];
    const copy = [...txns];
    copy.sort((a, b) => {
      const da = new Date(a.created_at).getTime();
      const db = new Date(b.created_at).getTime();
      return sortByDate === 'asc' ? da - db : db - da;
    });
    return copy;
  }, [txns, sortByDate]);

  if (loading || !customer) {
    return <div style={{ ...emp.pageWrap, ...emp.loading }}>Loading...</div>;
  }

  return (
    <motion.div style={emp.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section style={emp.section}>
        <button type="button" style={{ ...emp.btnSecondary, marginBottom: 16 }} onClick={() => navigate('/employee/customers')}>← Back</button>
      </section>
      <section style={emp.hero}>
        <h1 style={emp.heroTitle}>{customer.name}</h1>
        <p style={emp.heroSubtitle}>{customer.account_number} · {customer.email}</p>
      </section>
      {error && <div style={{ ...emp.alert, ...emp.alertError }}>{error}</div>}
      <section style={emp.section}>
        <div style={{ ...emp.statGrid, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
          <div style={emp.statCard}><div style={emp.statLabel}>Balance</div><div style={{ ...emp.statValue, color: '#0d9488' }}>{formatAmount(customer.balance)}</div></div>
          <div style={emp.statCard}><div style={emp.statLabel}>KYC</div><span style={{ ...emp.badge, ...(customer.kyc_status === 'verified' ? emp.badgeSuccess : customer.kyc_status === 'rejected' ? emp.badgeError : { background: '#f1f5f9', color: '#64748b' }) }}>{customer.kyc_status}</span></div>
          <div style={emp.statCard}><div style={emp.statLabel}>Status</div><span style={{ ...emp.badge, ...(customer.status === 'active' ? emp.badgeSuccess : { background: '#f1f5f9', color: '#64748b' }) }}>{customer.status}</span></div>
        </div>
      </section>
      <section style={emp.section}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {customer.kyc_status === 'pending' && (
            <><motion.button type="button" style={emp.btnPrimary} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setKycOpen(true); setKycAction('verified'); }}>Verify KYC</motion.button>
            <motion.button type="button" style={emp.btnDanger} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setKycOpen(true); setKycAction('rejected'); }}>Reject KYC</motion.button></>
          )}
          <motion.button type="button" style={emp.btnPrimary} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTellerOpen(true); setTellerType('deposit'); }}>Branch Deposit</motion.button>
          <motion.button type="button" style={emp.btnSecondary} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { setTellerOpen(true); setTellerType('withdraw'); }}>Branch Withdraw</motion.button>
        </div>
      </section>

      {/* KYC document uploaded by customer */}
      <section style={emp.section}>
        <h2 style={emp.sectionTitle}>KYC Document</h2>
        <motion.div style={emp.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {customer.kyc_proof ? (
            <div style={{ padding: 20 }}>
              <a
                href={customer.kyc_proof}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...emp.btnSecondary, display: 'inline-block', marginBottom: 16, textDecoration: 'none' }}
              >
                Open in new tab
              </a>
              {customer.kyc_proof.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  title="KYC document"
                  src={customer.kyc_proof}
                  style={{ width: '100%', height: 480, border: '1px solid #e2e8f0', borderRadius: 8 }}
                />
              ) : (
                <div style={{ marginTop: 12 }}>
                  <img
                    src={customer.kyc_proof}
                    alt="KYC document"
                    style={{ maxWidth: '100%', maxHeight: 480, objectFit: 'contain', border: '1px solid #e2e8f0', borderRadius: 8 }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No KYC document uploaded.</div>
          )}
        </motion.div>
      </section>

      <section style={emp.section}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <h2 style={{ ...emp.sectionTitle, margin: 0 }}>Transactions</h2>
          <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)} style={emp.input} title="Sort by date">
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
        <motion.div style={emp.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={emp.tableWrap}>
            <table style={emp.table}>
              <thead><tr><th style={emp.th}>Date</th><th style={emp.th}>Type</th><th style={emp.th}>Description</th><th style={{ ...emp.th, textAlign: 'right' }}>Amount</th></tr></thead>
              <tbody>
                {sortedTxns.length === 0 ? <tr><td colSpan={4} style={emp.empty}>No transactions</td></tr> : sortedTxns.map((t) => (
                  <tr key={t.id}>
                    <td style={emp.td}>{formatDate(t.created_at)}</td>
                    <td style={emp.td}><span style={{ ...emp.badge, ...(t.type === 'credit' ? emp.badgeSuccess : { background: '#f1f5f9', color: '#475569' }) }}>{t.type}</span></td>
                    <td style={emp.td}>{t.description || '—'}</td>
                    <td style={{ ...emp.td, textAlign: 'right', color: t.type === 'credit' ? '#059669' : '#334155', fontWeight: 600 }}>{t.type === 'credit' ? '+' : '-'}{formatAmount(t.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>
      {kycOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400 }}>
            <h3 style={{ margin: '0 0 12px' }}>{kycAction === 'verified' ? 'Verify KYC' : 'Reject KYC'}</h3>
            <p style={{ margin: '0 0 20px', color: '#64748b' }}>Confirm for {customer.name}?</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" style={emp.btnSecondary} onClick={() => setKycOpen(false)}>Cancel</button>
              <button type="button" style={kycAction === 'verified' ? emp.btnPrimary : emp.btnDanger} onClick={handleKyc} disabled={acting}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      {tellerOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 400, width: '90%' }}>
            <h3 style={{ margin: '0 0 20px' }}>{tellerType === 'deposit' ? 'Branch Deposit' : 'Branch Withdraw'}</h3>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Amount</label>
            <input type="number" required value={amount} onChange={(e) => setAmount(e.target.value)} style={{ ...emp.input, width: '100%', marginBottom: 16, boxSizing: 'border-box' }} />
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Description</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...emp.input, width: '100%', marginBottom: 24, boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" style={emp.btnSecondary} onClick={() => setTellerOpen(false)}>Cancel</button>
              <button type="button" style={emp.btnPrimary} onClick={handleTeller} disabled={acting || !amount}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
