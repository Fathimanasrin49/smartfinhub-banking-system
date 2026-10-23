import pool from '../../config/database.js';
import { sendMail } from '../../config/mailer.js';

const OTP_EXPIRY_MINUTES = 10;
const OTP_LENGTH = 6;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const signup = async (req, res) => {
  try {
    const { role, name, email, phone, address, password, empRole } = req.body || {};
    const files = req.files || [];
    const photoFile = files.find((f) => f.fieldname === 'photo');
    const kycFile = files.find((f) => f.fieldname === 'kycProof');

    if (!role || !name || !email || !password) {
      const msg = 'Role, name, email and password required';
      if (!Object.keys(req.body || {}).length) {
        console.error('[Signup] req.body empty - multipart may not have parsed. Check Content-Type.');
      }
      return res.status(400).json({ success: false, message: msg });
    }
    if (!['customer', 'employee'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const pwd = String(password || '');
    if (pwd.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    if (!/[A-Z]/.test(pwd)) return res.status(400).json({ success: false, message: 'Password must contain at least 1 capital letter' });
    if (!/[0-9]/.test(pwd)) return res.status(400).json({ success: false, message: 'Password must contain at least 1 number' });
    if (!/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/;'`~]/.test(pwd)) return res.status(400).json({ success: false, message: 'Password must contain at least 1 special character' });

    const [existingCust] = await pool.execute('SELECT id FROM customers WHERE email = ?', [email]);
    const [existingEmp] = await pool.execute('SELECT id FROM employees WHERE email = ?', [email]);
    if (existingCust.length || existingEmp.length) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const photoPath = photoFile ? `/uploads/photos/${photoFile.filename}` : null;

    if (role === 'customer') {
      if (!phone || !address || !kycFile) {
        return res.status(400).json({ success: false, message: 'Phone, address and KYC proof required for customer' });
      }
      const kycPath = `/uploads/kyc/${kycFile.filename}`;
      const accountNumber = 'ACC' + Date.now().toString().slice(-8);
      const [result] = await pool.execute(
        'INSERT INTO customers (account_number, name, email, phone, address, photo, kyc_proof, password, balance, kyc_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)',
        [accountNumber, name.trim(), email.trim(), phone.trim(), address?.trim() || '', photoPath, kycPath, password, 'pending']
      );
      const [rows] = await pool.execute(
        'SELECT id, account_number, name, email, status FROM customers WHERE id = ?',
        [result.insertId]
      );
      return res.status(201).json({ success: true, data: { ...rows[0], role: 'customer' } });
    }

    const { branchId } = req.body || {};
    if (!empRole || !branchId) {
      return res.status(400).json({ success: false, message: 'Employee role and branch assignment required' });
    }
    const employeeId = 'EMP' + Date.now().toString().slice(-8);
    const [result] = await pool.execute(
      'INSERT INTO employees (employee_id, name, email, phone, role, photo, password, branch_id, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [employeeId, name.trim(), email.trim(), phone || null, empRole.trim(), photoPath, password, parseInt(branchId, 10), 'active']
    );
    const [rows] = await pool.execute(
      'SELECT id, employee_id, name, email, status, branch_id FROM employees WHERE id = ?',
      [result.insertId]
    );
    return res.status(201).json({ success: true, data: { ...rows[0], role: 'employee' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const [customers] = await pool.execute(
      'SELECT id, account_number, name, email, status FROM customers WHERE email = ? AND password = ?',
      [email, password]
    );
    if (customers.length) {
      const c = customers[0];
      if (c.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account is not active' });
      }
      return res.json({ success: true, data: { ...c, role: 'customer' } });
    }

    const [employees] = await pool.execute(
      'SELECT id, employee_id, name, email, status, branch_id FROM employees WHERE email = ? AND password = ?',
      [email, password]
    );
    if (employees.length) {
      const e = employees[0];
      if (e.status !== 'active') {
        return res.status(403).json({ success: false, message: 'Account is not active' });
      }
      return res.json({ success: true, data: { ...e, role: 'employee' } });
    }

    const [admins] = await pool.execute(
      'SELECT id, email, name, role FROM admins WHERE email = ? AND password = ? AND status = ?',
      [email, password, 'active']
    );
    if (admins.length) {
      const admin = admins[0];
      try {
        await pool.execute(
          'INSERT INTO audit_logs (admin_id, action, entity, entity_id, details, ip) VALUES (?, ?, ?, ?, ?, ?)',
          [admin.id, 'admin_login', 'admin', admin.id, JSON.stringify({ email: admin.email }), req.ip || null]
        );
      } catch (logErr) {
        console.error('[Audit] Failed to log admin login:', logErr.message);
      }
      return res.json({ success: true, data: { ...admin, role: 'admin' } });
    }

    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    const [customers] = await pool.execute(
      'SELECT id, name, email, status FROM customers WHERE email = ?',
      [email.trim()]
    );
    if (!customers.length) {
      return res.status(404).json({ success: false, message: 'No account found with this email. Please sign up first.' });
    }
    const customer = customers[0];
    if (customer.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is not active' });
    }

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    await pool.execute('DELETE FROM otps WHERE customer_id = ?', [customer.id]);
    await pool.execute(
      'INSERT INTO otps (customer_id, otp_code, expires_at) VALUES (?, ?, ?)',
      [customer.id, otpCode, expiresAt]
    );

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('[OTP] SMTP not configured. Use OTP for testing:', otpCode);
      return res.json({ success: true, message: 'OTP sent (dev mode: check server console for OTP)' });
    }

    console.log(`[OTP] Sending OTP email to ${customer.email}...`);
    let mailInfo;
    try {
      mailInfo = await sendMail({
        to: customer.email,
        subject: 'Your Smart Fin Hub login OTP',
        text: `Your one-time password is ${otpCode}. It expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share this code.`,
        html: `
          <div style="font-family:sans-serif;max-width:400px;margin:0 auto;">
            <h2 style="color:#0d9488;">Smart Fin Hub</h2>
            <p>Hi ${customer.name},</p>
            <p>Your one-time password for login is:</p>
            <p style="font-size:28px;font-weight:700;letter-spacing:4px;color:#0f766e;">${otpCode}</p>
            <p style="color:#64748b;">This code expires in ${OTP_EXPIRY_MINUTES} minutes. Do not share it with anyone.</p>
            <p style="color:#94a3b8;font-size:12px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
      console.log(`[OTP] OTP email sent successfully to ${customer.email}. Message ID: ${mailInfo?.messageId || 'N/A'}`);
    } catch (mailErr) {
      console.error(`[OTP] Failed to send OTP email to ${customer.email}.`, mailErr.message);
      throw new Error('OTP email is not ready to send. Please check SMTP configuration.');
    }

    return res.json({ success: true, message: 'OTP sent to your registered email' });
  } catch (err) {
    console.error('[Send OTP]', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to send OTP' });
  }
};

export const loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    const otpCode = String(otp).trim().replace(/\s/g, '');
    if (otpCode.length !== OTP_LENGTH) {
      return res.status(400).json({ success: false, message: 'OTP must be 6 digits' });
    }

    const [customers] = await pool.execute(
      'SELECT id, account_number, name, email, status FROM customers WHERE email = ?',
      [email.trim()]
    );
    if (!customers.length) {
      return res.status(401).json({ success: false, message: 'Invalid email or OTP' });
    }
    const customer = customers[0];
    if (customer.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is not active' });
    }

    const [rows] = await pool.execute(
      'SELECT id, otp_code, expires_at FROM otps WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1',
      [customer.id]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'OTP expired or not found. Please request a new one.' });
    }
    const record = rows[0];
    if (new Date(record.expires_at) < new Date()) {
      await pool.execute('DELETE FROM otps WHERE customer_id = ?', [customer.id]);
      return res.status(401).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp_code !== otpCode) {
      return res.status(401).json({ success: false, message: 'Invalid OTP' });
    }

    await pool.execute('DELETE FROM otps WHERE customer_id = ?', [customer.id]);
    return res.json({ success: true, data: { ...customer, role: 'customer' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBranches = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name FROM branches');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
