import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AccountCard from '../../components/customer/AccountCard';
import BalanceCard from '../../components/customer/BalanceCard';
import { customerApi } from '../../services/customerApi';

export default function CustomerDashboard() {
  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, b, approvalsRes, tokenRes] = await Promise.allSettled([
          customerApi.getProfile(),
          customerApi.getBalance(),
          customerApi.getPendingApprovals(),
          customerApi.getTokenStatus(),
        ]);
        if (p.status === 'fulfilled' && p.value?.success) setProfile(p.value.data);
        if (b.status === 'fulfilled' && b.value?.success) setBalance(b.value.data?.balance);
        if (approvalsRes.status === 'fulfilled' && approvalsRes.value?.success) {
          setPendingApprovals(Array.isArray(approvalsRes.value.data) ? approvalsRes.value.data.length : 0);
        }
        if (tokenRes.status === 'fulfilled' && tokenRes.value?.success) {
          const tokens = Array.isArray(tokenRes.value.data) ? tokenRes.value.data : [];
          // Prefer currently waiting token; otherwise show most recent token if any.
          const active = tokens.find((t) => t.status === 'waiting') || tokens[0] || null;
          setToken(active);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const balanceText = useMemo(
    () => `₹${Number(balance || 0).toLocaleString('en-IN')}`,
    [balance]
  );

  const insights = [
    { title: 'Current Balance', value: balanceText, tone: '#0d9488' },
    { title: 'Pending Approvals', value: pendingApprovals, tone: '#d97706' },
    { title: 'KYC Status', value: profile?.kyc_status || 'pending', tone: profile?.kyc_status === 'verified' ? '#059669' : '#64748b' },
    {
      title: 'Queue Token',
      value: token?.token_number
        ? token.status && token.status !== 'waiting'
          ? `${token.token_number} (${token.status})`
          : token.token_number
        : 'Not generated',
      tone: '#0284c7',
    },
  ];

  return (
    <motion.div
      style={styles.pageWrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <section style={styles.heroPanel}>
        <div>
          <div style={styles.heroTag}>Personal Banking Workspace</div>
          <h1 style={styles.heroTitle}>Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}</h1>
          <p style={styles.heroSubtitle}>Track balance, move money, and manage service requests from a single smart dashboard.</p>
          <div style={styles.heroMeta}>
            <span style={styles.heroPill}>Account: {profile?.account_number || '—'}</span>
            <span style={styles.heroPill}>Status: {profile?.status || 'active'}</span>
          </div>
        </div>
        <div style={styles.balanceDock}>
          <div style={styles.balanceDockLabel}>Available Balance</div>
          <div style={styles.balanceDockValue}>{balanceText}</div>
          <Link to="/customer/passbook" style={styles.balanceDockLink}>Open passbook →</Link>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Account Pulse</h2>
        <div style={styles.insightGrid}>
          {insights.map((item) => (
            <motion.div
              key={item.title}
              style={{ ...styles.insightCard, borderTopColor: item.tone }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div style={styles.insightTitle}>{item.title}</div>
              <div style={{ ...styles.insightValue, color: item.tone }}>{item.value}</div>
            </motion.div>
          ))}
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Live Balance</h2>
        <BalanceCard balance={balance} loading={loading} />
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Quick Actions</h2>
        <div style={styles.quickGrid}>
          <Link to="/customer/deposit" style={styles.quickBtn}><span style={styles.quickIcon}>↓</span>Deposit</Link>
          <Link to="/customer/withdraw" style={styles.quickBtn}><span style={styles.quickIcon}>↑</span>Withdraw</Link>
          <Link to="/customer/transfer" style={styles.quickBtn}><span style={styles.quickIcon}>⇄</span>Transfer</Link>
          <Link to="/customer/passbook" style={styles.quickBtn}><span style={styles.quickIcon}>▤</span>Passbook</Link>
          <Link to="/customer/queue" style={styles.quickBtn}><span style={styles.quickIcon}>#</span>Branch Queue</Link>
          <Link to="/customer/feedback" style={styles.quickBtn}><span style={styles.quickIcon}>★</span>Feedback</Link>
        </div>
      </section>

      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Profile Snapshot</h2>
        <AccountCard profile={profile} />
      </section>
    </motion.div>
  );
}

const styles = {
  pageWrap: { minHeight: '100vh' },
  heroPanel: {
    marginBottom: 32,
    background: 'linear-gradient(140deg, #0f172a 0%, #1e293b 58%, #0f766e 140%)',
    borderRadius: 20,
    padding: 28,
    color: '#e2e8f0',
    display: 'grid',
    gridTemplateColumns: '1.4fr 320px',
    gap: 20,
  },
  heroTag: {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.14)',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: '0.04em',
  },
  heroTitle: { margin: '10px 0 0', fontSize: 34, fontWeight: 800, color: '#fff' },
  heroSubtitle: { margin: '10px 0 0', fontSize: 15, color: '#cbd5e1', lineHeight: 1.6 },
  heroMeta: { marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' },
  heroPill: {
    padding: '6px 12px',
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.25)',
    fontSize: 12,
  },
  balanceDock: {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 16,
    padding: 18,
    alignSelf: 'start',
  },
  balanceDockLabel: { fontSize: 12, color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 },
  balanceDockValue: { marginTop: 6, fontSize: 30, fontWeight: 800, color: '#fff' },
  balanceDockLink: { marginTop: 10, display: 'inline-block', color: '#5eead4', textDecoration: 'none', fontWeight: 600, fontSize: 13 },
  section: {
    marginBottom: 36,
  },
  sectionTitle: { margin: '0 0 16px', fontSize: 20, fontWeight: 700, color: '#334155' },
  insightGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: 14,
  },
  insightCard: {
    background: '#fff',
    borderRadius: 14,
    border: '1px solid #e2e8f0',
    borderTop: '4px solid #0d9488',
    padding: 16,
  },
  insightTitle: { fontSize: 13, color: '#64748b', fontWeight: 600 },
  insightValue: { marginTop: 8, fontSize: 24, fontWeight: 800, color: '#1e293b', textTransform: 'capitalize' },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
    gap: 14,
  },
  quickBtn: {
    padding: 16,
    background: '#fff',
    borderRadius: 12,
    textAlign: 'left',
    textDecoration: 'none',
    color: '#1e293b',
    fontWeight: 600,
    fontSize: 15,
    border: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  quickIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: '#f0fdfa',
    color: '#0d9488',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 700,
  },
};
