import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { customerApi } from '../../services/customerApi';

const CATEGORY_COLORS = {
  food: '#f59e0b',
  shopping: '#8b5cf6',
  bills: '#3b82f6',
  transport: '#10b981',
  entertainment: '#ec4899',
  transfer: '#64748b',
  other: '#94a3b8',
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipLabel}>{`${payload[0].name}`}</p>
        <p style={styles.tooltipValue}>{`₹${payload[0].value.toLocaleString('en-IN')}`}</p>
      </div>
    );
  }
  return null;
};

export default function Expenses() {
  const [summary, setSummary] = useState({});
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await customerApi.getExpenseInsights(startDate || undefined, endDate || undefined);
      if (res.success) {
        setSummary(res.data?.summary || {});
        setInsights(res.data?.insights || '');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [startDate, endDate]);

  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  const entries = Object.entries(summary);

  const chartData = entries.map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: CATEGORY_COLORS[name] || '#94a3b8'
  }));

  return (
    <motion.div
      style={styles.pageWrap}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Expense Tracking</h1>
        <p style={styles.heroSubtitle}>Auto-categorized spending insights.</p>
      </section>

      <section style={styles.section}>
        <div style={styles.contentContainer}>
          <div style={styles.leftCol}>
            <div style={styles.filters}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={styles.input}
                />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={styles.input}
                />
              </div>
            </div>

            {loading ? (
              <p style={styles.loading}>Analyzing your data...</p>
            ) : entries.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.empty}>No expense data for this period.</p>
              </div>
            ) : (
              <div style={styles.visualSection}>
                <div style={styles.chartWrapper}>
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={1500}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={styles.chartCenterText}>
                    <span style={styles.centerLabel}>Total</span>
                    <span style={styles.centerValue}>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={styles.categoryList}>
                  {chartData.map((item, i) => (
                    <motion.div
                      key={item.name}
                      style={styles.legendItem}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div style={{ ...styles.colorDot, background: item.color }} />
                      <div style={styles.legendDetails}>
                        <span style={styles.legendName}>{item.name}</span>
                        <span style={styles.legendValue}>₹{item.value.toLocaleString('en-IN')}</span>
                      </div>
                      <span style={styles.legendPercent}>
                        {((item.value / total) * 100).toFixed(1)}%
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={styles.rightCol}>
            {insights && (
              <motion.div
                style={styles.insights}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div style={styles.insightsHeader}>
                  <span style={styles.sparkleIcon}>✨</span>
                  <h3 style={styles.insightsTitle}>AI Spending Insights</h3>
                </div>
                <p style={styles.insightsText}>{insights}</p>
              </motion.div>
            )}

            {!loading && entries.length > 0 && (
              <div style={styles.summaryCard}>
                <h4 style={styles.summaryTitle}>Monthly Summary</h4>
                <div style={styles.summaryRow}>
                  <span>Highest Spending</span>
                  <span style={{ fontWeight: 600, color: chartData[0]?.color }}>
                    {chartData.sort((a,b) => b.value - a.value)[0]?.name}
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <span>Transaction Count</span>
                  <span style={{ fontWeight: 600 }}>{entries.length} Categories</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </motion.div>
  );
}

const styles = {
  pageWrap: { minHeight: '100vh', padding: '40px 20px', backgroundColor: '#f8fafc' },
  hero: { marginBottom: 48, textAlign: 'center' },
  heroTitle: { margin: 0, fontSize: 36, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' },
  heroSubtitle: { margin: '12px 0 0', fontSize: 18, color: '#64748b' },
  section: { maxWidth: 1200, margin: '0 auto' },
  contentContainer: { display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 32, alignItems: 'start' },
  leftCol: { background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: 24 },
  filters: { display: 'flex', gap: 24, marginBottom: 40, borderBottom: '1px solid #f1f5f9', paddingBottom: 24 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 13, fontWeight: 600, color: '#64748b', textTransform: 'uppercase' },
  input: {
    padding: '12px 16px',
    borderRadius: 12,
    border: '2px solid #f1f5f9',
    fontSize: 15,
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
    cursor: 'pointer',
    backgroundColor: '#f8fafc'
  },
  loading: { padding: 80, color: '#64748b', textAlign: 'center', fontSize: 16, fontWeight: 500 },
  visualSection: { display: 'flex', flexDirection: 'column', gap: 40 },
  chartWrapper: { position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chartCenterText: {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: { fontSize: 14, color: '#64748b', fontWeight: 500 },
  centerValue: { fontSize: 24, fontWeight: 800, color: '#0f172a' },
  categoryList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px',
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    border: '1px solid #f1f5f9'
  },
  colorDot: { width: 12, height: 12, borderRadius: 6 },
  legendDetails: { flex: 1, display: 'flex', flexDirection: 'column' },
  legendName: { fontSize: 14, fontWeight: 600, color: '#334155' },
  legendValue: { fontSize: 13, color: '#64748b' },
  legendPercent: { fontSize: 14, fontWeight: 700, color: '#0f172a' },
  insights: {
    background: 'linear-gradient(135deg, #fff 0%, #f0fdfa 100%)',
    borderRadius: 24,
    padding: 32,
    border: '1px solid #ccfbf1',
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)'
  },
  insightsHeader: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  sparkleIcon: { fontSize: 24 },
  insightsTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#0f766e' },
  insightsText: { margin: 0, color: '#334155', lineHeight: 1.7, fontSize: 15 },
  summaryCard: {
    background: '#fff',
    borderRadius: 24,
    padding: 32,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    border: '1px solid #f1f5f9'
  },
  summaryTitle: { margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#0f172a' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f1f5f9', fontSize: 14, color: '#64748b' },
  emptyState: { padding: 80, textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: 24 },
  empty: { color: '#64748b', fontSize: 16 },
  tooltip: {
    backgroundColor: '#1e293b',
    color: '#fff',
    padding: '12px 16px',
    borderRadius: 12,
    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    border: 'none'
  },
  tooltipLabel: { margin: '0 0 4px', fontSize: 12, fontWeight: 600, opacity: 0.8, textTransform: 'uppercase' },
  tooltipValue: { margin: 0, fontSize: 18, fontWeight: 700 },
};
