import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/adminApi';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.getSettings().then((r) => r.success && setSettings(r.data || {})).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await adminApi.updateSettings(settings);
      setSaving(false);
    } catch (e) {
      setSaving(false);
    }
  };

  const handleBackup = async () => {
    try {
      await adminApi.triggerBackup();
      alert('Backup initiated');
    } catch (e) {
      console.error(e);
    }
  };

  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));

  if (loading) return <p>Loading...</p>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 style={styles.title}>System Settings</h1>
      <p style={styles.subtitle}>Security policies, limits, and data management</p>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Transaction & Security</h3>
        <div style={styles.field}>
          <label>Max transaction limit (₹)</label>
          <input
            type="number"
            value={settings.max_transaction_limit || ''}
            onChange={(e) => update('max_transaction_limit', e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label>Fraud alert threshold (₹)</label>
          <input
            type="number"
            value={settings.fraud_alert_threshold || ''}
            onChange={(e) => update('fraud_alert_threshold', e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label>Session timeout (minutes)</label>
          <input
            type="number"
            value={settings.session_timeout_minutes || ''}
            onChange={(e) => update('session_timeout_minutes', e.target.value)}
            style={styles.input}
          />
        </div>
        <div style={styles.field}>
          <label>Require OTP for transfer</label>
          <select
            value={settings.require_otp_for_transfer || 'false'}
            onChange={(e) => update('require_otp_for_transfer', e.target.value)}
            style={styles.input}
          >
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        <div style={styles.field}>
          <label>Backup enabled</label>
          <select
            value={settings.backup_enabled || 'true'}
            onChange={(e) => update('backup_enabled', e.target.value)}
            style={styles.input}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <button onClick={handleSave} disabled={saving} style={styles.btn}>
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Data Backup</h3>
        <p style={styles.desc}>Trigger manual backup of encrypted data</p>
        <button onClick={handleBackup} style={styles.btnOutline}>
          Trigger Backup
        </button>
      </div>
    </motion.div>
  );
}

const styles = {
  title: { margin: '0 0 4px', fontSize: 28, fontWeight: 700 },
  subtitle: { margin: '0 0 24px', color: '#64748b', fontSize: 15 },
  card: { background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', marginBottom: 24 },
  cardTitle: { margin: '0 0 20px', fontSize: 18, fontWeight: 600 },
  field: { marginBottom: 16 },
  input: { width: '100%', maxWidth: 300, padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' },
  btn: { padding: '12px 24px', background: '#0d9488', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' },
  btnOutline: { padding: '12px 24px', background: 'transparent', color: '#0d9488', border: '2px solid #0d9488', borderRadius: 10, cursor: 'pointer' },
  desc: { margin: '0 0 16px', color: '#64748b' },
};
