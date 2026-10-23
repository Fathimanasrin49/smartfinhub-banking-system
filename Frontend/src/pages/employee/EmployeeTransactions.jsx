import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { employeeApi } from '../../services/employeeApi';
import { emp } from '../../styles/employeeTheme';

export default function EmployeeTransactions() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountNumber, setAccountNumber] = useState('');
  const [type, setType] = useState('');
  const [sortByDate, setSortByDate] = useState('desc');

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (accountNumber) params.accountNumber = accountNumber;
      if (type) params.type = type;
      const res = await employeeApi.getTransactions({ ...params, limit: 100 });
      if (res.success) setTxns(res.data);
    } catch (e) {
      setTxns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [accountNumber, type]);

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

  const formatAmount = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n || 0);
  const formatDate = (d) => new Date(d).toLocaleString('en-IN');

  return (
    <motion.div style={emp.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section style={emp.hero}>
        <h1 style={emp.heroTitle}>Transactions</h1>
        <p style={emp.heroSubtitle}>View customer transaction history.</p>
      </section>
      <section style={emp.section}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <input type="text" placeholder="Account number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} style={emp.input} />
          <select value={type} onChange={(e) => setType(e.target.value)} style={emp.input}>
            <option value="">All types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <select value={sortByDate} onChange={(e) => setSortByDate(e.target.value)} style={emp.input} title="Sort by date">
            <option value="desc">Newest first</option>
            <option value="asc">Oldest first</option>
          </select>
        </div>
        <motion.div style={emp.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={emp.tableWrap}>
            <table style={emp.table}>
              <thead>
                <tr>
                  <th style={emp.th}>Date</th>
                  <th style={emp.th}>ID</th>
                  <th style={emp.th}>Type</th>
                  <th style={emp.th}>Sender</th>
                  <th style={emp.th}>Receiver</th>
                  <th style={{ ...emp.th, textAlign: 'right' }}>Amount</th>
                  <th style={emp.th}>Description</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={7} style={emp.loading}>Loading...</td></tr> :
                  sortedTxns.length === 0 ? <tr><td colSpan={7} style={emp.empty}>No transactions</td></tr> :
                  sortedTxns.map((t) => (
                    <tr key={t.id}>
                      <td style={emp.td}>{formatDate(t.created_at)}</td>
                      <td style={emp.td}>{t.transaction_id}</td>
                      <td style={emp.td}><span style={{ ...emp.badge, ...(t.type === 'credit' ? emp.badgeSuccess : { background: '#f1f5f9', color: '#475569' }) }}>{t.type}</span></td>
                      <td style={emp.td}>{t.sender_account || '-'}</td>
                      <td style={emp.td}>{t.receiver_account || '-'}</td>
                      <td style={{ ...emp.td, textAlign: 'right', color: t.type === 'credit' ? '#059669' : '#334155', fontWeight: 600 }}>{t.type === 'credit' ? '+' : '-'}{formatAmount(t.amount)}</td>
                      <td style={emp.td}>{t.description || '-'}</td>
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
