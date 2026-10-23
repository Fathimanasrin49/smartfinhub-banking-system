import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { employeeApi } from '../../services/employeeApi';
import { emp } from '../../styles/employeeTheme';

export default function EmployeeFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await employeeApi.getFeedback();
      if (res.success) setFeedback(res.data);
    } catch (e) {
      setFeedback([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const formatDate = (d) => new Date(d).toLocaleString('en-IN');
  const avgRating = feedback.length > 0 ? (feedback.reduce((s, f) => s + f.rating, 0) / feedback.length).toFixed(1) : 0;

  return (
    <motion.div style={emp.pageWrap} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <section style={emp.hero}>
        <h1 style={emp.heroTitle}>Customer Feedback</h1>
        <p style={emp.heroSubtitle}>View and monitor customer feedback.</p>
      </section>

      {feedback.length > 0 && (
        <section style={emp.section}>
          <motion.div style={emp.statCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={emp.statLabel}>Average rating</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ ...emp.statValue, color: '#0d9488' }}>{avgRating}</span>
              <span style={{ color: '#64748b', fontSize: 14 }}>/ 5</span>
            </div>
          </motion.div>
        </section>
      )}

      <section style={emp.section}>
        <motion.div style={emp.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={emp.tableWrap}>
            <table style={emp.table}>
              <thead>
                <tr>
                  <th style={emp.th}>Date</th>
                  <th style={emp.th}>Customer</th>
                  <th style={emp.th}>Rating</th>
                  <th style={emp.th}>Message</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td colSpan={4} style={emp.loading}>Loading...</td></tr> :
                  feedback.length === 0 ? <tr><td colSpan={4} style={emp.empty}>No feedback yet</td></tr> :
                  feedback.map((f) => (
                    <tr key={f.id}>
                      <td style={emp.td}>{formatDate(f.created_at)}</td>
                      <td style={emp.td}>{f.customer_name}</td>
                      <td style={emp.td}>
                        <span style={{ color: '#f59e0b', fontWeight: 600 }}>{'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}</span>
                      </td>
                      <td style={emp.td}>{f.message || '-'}</td>
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
