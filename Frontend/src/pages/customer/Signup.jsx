import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../../services/authApi';
import { useAuth } from '../../context/useAuth';

const EMPLOYEE_ROLES = ['Teller', 'Cashier', 'Branch Manager', 'Relationship Manager', 'Support Staff'];

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

const validatePassword = (p) => {
  if (p.length < 6) return 'Password must be at least 6 characters';
  if (!/[A-Z]/.test(p)) return 'Password must contain at least 1 capital letter';
  if (!/[0-9]/.test(p)) return 'Password must contain at least 1 number';
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/;'`~]/.test(p)) return 'Password must contain at least 1 special character';
  return null;
};

function Signup() {
  const [role, setRole] = useState('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [empRole, setEmpRole] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [kycFile, setKycFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const photoRef = useRef();
  const kycRef = useRef();
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await authApi.getBranches();
        if (res.success) setBranches(res.data);
      } catch (err) {
        console.error('Failed to fetch branches', err);
      }
    };
    fetchBranches();
  }, []);

  const handlePhotoChange = (e) => {
    const f = e.target.files?.[0];
    if (f && f.type.startsWith('image/')) setPhotoFile(f);
  };
  const handleKycChange = (e) => {
    const f = e.target.files?.[0];
    if (f) setKycFile(f);
  };

  const [photoPreview, setPhotoPreview] = useState(null);
  useEffect(() => {
    if (photoFile) {
      const url = URL.createObjectURL(photoFile);
      setPhotoPreview(url);
      return () => {
        URL.revokeObjectURL(url);
        setPhotoPreview(null);
      };
    }
    setPhotoPreview(null);
  }, [photoFile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const pwdErr = validatePassword(password);
    if (pwdErr) {
      setError(pwdErr);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (role === 'customer' && !kycFile) {
      setError('KYC proof is required');
      return;
    }
    if (role === 'employee' && !empRole) {
      setError('Please select your role');
      return;
    }
    if (role === 'employee' && !branchId) {
      setError('Please select your branch');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('role', role);
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('password', password);
      if (role === 'customer') {
        formData.append('address', address);
        if (kycFile) formData.append('kycProof', kycFile);
      } else {
        formData.append('empRole', empRole);
        formData.append('branchId', branchId);
      }
      if (photoFile) formData.append('photo', photoFile);
      const res = await authApi.signup(formData);
      if (res.success) {
        login(res.data);
        navigate(res.data.role === 'employee' ? '/employee/dashboard' : '/customer/dashboard');
      } else {
        setError(res.message || 'Signup failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || (err.code === 'ERR_NETWORK' ? 'Cannot reach server. Check if backend is running.' : err.message || 'Signup failed. Please try again.');
      setError(msg);
    } finally {
      setLoading(false);
    }
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
          <h1 style={styles.brandTitle}>Create Account</h1>
          <p style={styles.brandTagline}>Join Smart Fin Hub as a customer or employee</p>
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
          <h2 style={styles.formTitle}>Register</h2>
          <p style={styles.formSubtitle}>Fill in your details to get started</p>

          <div style={styles.tabs}>
            <button
              type="button"
              onClick={() => { setRole('customer'); setError(''); }}
              style={{
                ...styles.tab,
                ...(role === 'customer' ? styles.tabActive : {}),
              }}
            >
              Customer
            </button>
            <button
              type="button"
              onClick={() => { setRole('employee'); setError(''); }}
              style={{
                ...styles.tab,
                ...(role === 'employee' ? styles.tabActive : {}),
              }}
            >
              Employee
            </button>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <motion.div style={styles.error} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {error}
              </motion.div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Name"
                required
                style={styles.input}
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter Email"
                required
                style={styles.input}
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter Phone Number"
                required
                style={styles.input}
              />
            </div>

            <AnimatePresence mode="wait">
              {role === 'customer' ? (
                <motion.div
                  key="customer"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                >
                  <div style={styles.field}>
                    <label style={styles.label}>Address</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Street, City, State, PIN"
                      required
                      rows={3}
                      style={{ ...styles.input, resize: 'vertical' }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="employee"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
                >
                  <div style={styles.field}>
                    <label style={styles.label}>Role</label>
                    <select
                      value={empRole}
                      onChange={(e) => setEmpRole(e.target.value)}
                      required
                      style={styles.input}
                    >
                      <option value="">Select role</option>
                      {EMPLOYEE_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Assigned Branch</label>
                    <select
                      value={branchId}
                      onChange={(e) => setBranchId(e.target.value)}
                      required
                      style={styles.input}
                    >
                      <option value="">Select Branch</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={styles.field}>
              <label style={styles.label}>Photo</label>
              <div style={styles.fileRow}>
                <input
                  ref={photoRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  style={styles.fileBtn}
                >
                  {photoFile ? '✓ Photo selected' : 'Choose Photo'}
                </button>
                {photoPreview && (
                  <img src={photoPreview} alt="Preview" style={styles.preview} />
                )}
              </div>
            </div>

            {role === 'customer' && (
              <div style={styles.field}>
                <label style={styles.label}>KYC Proof (Aadhaar, PAN, etc.)</label>
                <div style={styles.fileRow}>
                  <input
                    ref={kycRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleKycChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => kycRef.current?.click()}
                    style={styles.fileBtn}
                  >
                    {kycFile ? '✓ KYC document selected' : 'Upload KYC Document'}
                  </button>
                </div>
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrap}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  minLength={6}
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
              <p style={styles.hint}>Min 6 chars, 1 uppercase, 1 number, 1 special char</p>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirm Password</label>
              <div style={styles.passwordWrap}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Password"
                  required
                  minLength={6}
                  style={{ ...styles.input, paddingRight: 48 }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  style={styles.eyeBtn}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <EyeIcon off={showConfirmPassword} />
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
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <p style={styles.footer}>
            Already have an account?{' '}
            <Link to="/login" style={styles.link}>Sign In</Link>
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
  brand: { color: '#fff', maxWidth: 400, position: 'relative' },
  brandTitle: { fontSize: 42, fontWeight: 700, margin: '0 0 12px', letterSpacing: '-0.02em' },
  brandTagline: { fontSize: 18, opacity: 0.9, margin: 0 },
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 48,
    background: '#f8fafc',
    overflowY: 'auto',
  },
  formCard: {
    width: '100%',
    maxWidth: 440,
    background: '#fff',
    borderRadius: 24,
    padding: 40,
    boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    margin: 'auto',
  },
  formTitle: { margin: '0 0 4px', fontSize: 28, fontWeight: 700, color: '#1e293b' },
  formSubtitle: { margin: '0 0 24px', color: '#64748b', fontSize: 15 },
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
    padding: '10px 16px',
    border: 'none',
    borderRadius: 10,
    background: 'transparent',
    fontSize: 14,
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
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  hint: { fontSize: 12, color: '#64748b', margin: 0 },
  label: { fontSize: 14, fontWeight: 600, color: '#334155' },
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
  fileRow: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' },
  fileBtn: {
    padding: '12px 20px',
    background: '#f1f5f9',
    border: '1px dashed #cbd5e1',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    color: '#64748b',
    cursor: 'pointer',
  },
  preview: { width: 48, height: 48, borderRadius: 8, objectFit: 'cover' },
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
  footer: { marginTop: 28, textAlign: 'center', fontSize: 14, color: '#64748b' },
  link: { color: '#0d9488', textDecoration: 'none', fontWeight: 600 },
};

export default Signup;
