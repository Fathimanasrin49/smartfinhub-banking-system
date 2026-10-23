import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../../services/authApi';
import { useAuth } from '../../context/useAuth';

const EyeIcon = ({ off = false }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    {off ? (
      <>
        <path d="M3 3L21 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M10.6 10.7C10.2 11 10 11.5 10 12C10 13.1 10.9 14 12 14C12.5 14 13 13.8 13.3 13.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M9.4 5.2C10.3 4.8 11.1 4.6 12 4.6C16.3 4.6 19.4 8.2 20.6 10.1C21 10.7 21 11.4 20.6 12C20.1 12.8 19.1 14.2 17.7 15.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M14.6 18.8C13.8 19.1 12.9 19.4 12 19.4C7.7 19.4 4.6 15.8 3.4 13.9C3 13.3 3 12.6 3.4 12C3.9 11.3 4.8 9.9 6 8.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </>
    ) : (
      <>
        <path d="M12 4.6C16.3 4.6 19.4 8.2 20.6 10.1C21 10.7 21 11.4 20.6 12C19.4 13.8 16.3 19.4 12 19.4C7.7 19.4 4.6 15.8 3.4 13.9C3 13.3 3 12.6 3.4 12C4.6 10.2 7.7 4.6 12 4.6Z" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
      </>
    )}
  </svg>
);

export default function Login() {
  const [loginMode, setLoginMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const clearMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      if (res.success) {
        login(res.data);
        const defaultDest = res.data.role === 'admin' ? '/admin/dashboard' : res.data.role === 'employee' ? '/employee/dashboard' : '/customer/dashboard';
        const from = location.state?.from?.pathname || '';
        const rolePrefix = res.data.role === 'admin' ? '/admin' : res.data.role === 'employee' ? '/employee' : '/customer';
        const dest = from.startsWith(rolePrefix) ? from : defaultDest;
        navigate(dest, { replace: true });
      } else {
        setError(res.message || 'Login failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || (err.code === 'ERR_NETWORK' ? 'Cannot reach server. Check if backend is running.' : err.message || 'Login failed. Check credentials.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Enter your email address');
      return;
    }
    clearMessages();
    setLoading(true);
    try {
      const res = await authApi.sendOtp(email.trim());
      if (res.success) {
        setOtpSent(true);
        setOtp('');
        setSuccessMsg(res.message || 'OTP sent to your registered email.');
      } else {
        setError(res.message || 'Failed to send OTP');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to send OTP';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    clearMessages();
    setLoading(true);
    try {
      const res = await authApi.loginWithOtp(email.trim(), otp.trim());
      if (res.success) {
        login(res.data);
        navigate('/customer/dashboard', { replace: true });
      } else {
        setError(res.message || 'Invalid or expired OTP');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Login failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchToOtp = () => {
    setLoginMode('otp');
    setOtpSent(false);
    setOtp('');
    clearMessages();
  };

  const switchToPassword = () => {
    setLoginMode('password');
    setOtpSent(false);
    setOtp('');
    clearMessages();
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.left}>
        <motion.div
          style={styles.brand}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={styles.brandTitle}>Smart Fin Hub</h1>
          <p style={styles.brandTagline}>Your trusted digital banking partner</p>
          <div style={styles.decoration} />
        </motion.div>
      </div>

      <div style={styles.right}>
        <motion.div
          style={styles.formCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 style={styles.formTitle}>Welcome back</h2>
          <p style={styles.formSubtitle}>Sign in to access your account</p>

          <div style={styles.tabs}>
            <button
              type="button"
              onClick={switchToPassword}
              style={{ ...styles.tab, ...(loginMode === 'password' ? styles.tabActive : {}) }}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={switchToOtp}
              style={{ ...styles.tab, ...(loginMode === 'otp' ? styles.tabActive : {}) }}
            >
              Email with OTP
            </button>
          </div>

          <AnimatePresence mode="wait">
            {loginMode === 'password' ? (
              <motion.form
                key="password"
                onSubmit={handlePasswordSubmit}
                style={styles.form}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {error && (
                  <motion.div style={styles.error} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                  </motion.div>
                )}
                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={styles.input}
                  />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Password</label>
                  <div style={styles.passwordWrap}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                      style={{ ...styles.input, paddingRight: 48 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      style={styles.eyeBtn}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon off={showPassword} />
                    </button>
                  </div>
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  style={{ ...styles.submit, ...(loading ? { opacity: 0.8, cursor: 'not-allowed' } : {}) }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={styles.form}
              >
                {error && (
                  <motion.div style={styles.error} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {error}
                  </motion.div>
                )}
                {successMsg && (
                  <motion.div style={styles.success} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    {successMsg}
                  </motion.div>
                )}
                <div style={styles.field}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setOtpSent(false); }}
                    placeholder="Registered email address"
                    required
                    style={styles.input}
                    disabled={otpSent}
                  />
                </div>
                {!otpSent ? (
                  <motion.button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={loading}
                    style={{ ...styles.submit, ...(loading ? { opacity: 0.8, cursor: 'not-allowed' } : {}) }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {loading ? 'Sending...' : 'Send OTP'}
                  </motion.button>
                ) : (
                  <>
                    <div style={styles.field}>
                      <label style={styles.label}>Enter 6-digit OTP</label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="000000"
                        maxLength={6}
                        style={{ ...styles.input, letterSpacing: 8, textAlign: 'center' }}
                        autoComplete="one-time-code"
                      />
                    </div>
                    <motion.button
                      type="button"
                      onClick={handleOtpSubmit}
                      disabled={loading || otp.length !== 6}
                      style={{ ...styles.submit, ...(loading || otp.length !== 6 ? { opacity: 0.8, cursor: 'not-allowed' } : {}) }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {loading ? 'Verifying...' : 'Sign in with OTP'}
                    </motion.button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      style={styles.resendBtn}
                    >
                      Resend OTP
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <p style={styles.footer}>
            Don't have an account?{' '}
            <Link to="/signup" style={styles.link}>Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: '100vh',
    minHeight: '100vh',
    display: 'flex',
    overflow: 'hidden',
  },
  left: {
    flex: 1,
    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 50%, #115e59 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  brand: {
    color: '#fff',
    maxWidth: 400,
    position: 'relative',
  },
  brandTitle: {
    fontSize: 42,
    fontWeight: 700,
    margin: '0 0 12px',
    letterSpacing: '-0.02em',
  },
  brandTagline: {
    fontSize: 18,
    opacity: 0.9,
    margin: 0,
  },
  decoration: {
    position: 'absolute',
    bottom: -60,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
  },
  right: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    background: '#f8fafc',
    overflow: 'auto',
  },
  formCard: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 24,
    padding: 40,
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
  },
  formTitle: {
    margin: '0 0 4px',
    fontSize: 28,
    fontWeight: 700,
    color: '#1e293b',
  },
  formSubtitle: {
    margin: '0 0 24px',
    color: '#64748b',
    fontSize: 15,
  },
  tabs: {
    display: 'flex',
    gap: 8,
    marginBottom: 24,
    background: '#f1f5f9',
    padding: 4,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    padding: '10px 12px',
    border: 'none',
    borderRadius: 8,
    background: 'transparent',
    fontSize: 13,
    fontWeight: 600,
    color: '#64748b',
    cursor: 'pointer',
  },
  tabActive: {
    background: '#fff',
    color: '#0d9488',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  error: {
    padding: 12,
    background: '#fef2f2',
    color: '#ef4444',
    borderRadius: 12,
    fontSize: 14,
  },
  success: {
    padding: 12,
    background: '#ecfdf5',
    color: '#059669',
    borderRadius: 12,
    fontSize: 14,
  },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: {
    fontSize: 14,
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    padding: '14px 16px',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    fontSize: 16,
    background: '#fff',
  },
  passwordWrap: {
    position: 'relative',
  },
  eyeBtn: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: 18,
    lineHeight: 1,
    padding: 4,
  },
  submit: {
    padding: 16,
    background: '#0d9488',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    marginTop: 8,
    cursor: 'pointer',
  },
  resendBtn: {
    marginTop: -8,
    padding: 8,
    background: 'transparent',
    border: 'none',
    fontSize: 14,
    color: '#0d9488',
    cursor: 'pointer',
    fontWeight: 500,
  },
  footer: {
    marginTop: 28,
    textAlign: 'center',
    fontSize: 14,
    color: '#64748b',
  },
  link: {
    color: '#0d9488',
    textDecoration: 'none',
    fontWeight: 600,
  },
};
