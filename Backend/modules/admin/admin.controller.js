import pool from '../../config/database.js';

const logAudit = async (adminId, action, entity, entityId, details, ip) => {
  await pool.execute(
    'INSERT INTO audit_logs (admin_id, action, entity, entity_id, details, ip) VALUES (?, ?, ?, ?, ?, ?)',
    [adminId, action, entity || null, entityId || null, details ? JSON.stringify(details) : null, ip || null]
  );
};

export const dashboard = async (req, res) => {
  try {
    const [[custCount]] = await pool.execute('SELECT COUNT(*) as c FROM customers');
    const [[empCount]] = await pool.execute('SELECT COUNT(*) as c FROM employees');
    const [[txnCount]] = await pool.execute('SELECT COUNT(*) as c FROM transactions WHERE DATE(created_at) = CURDATE()');
    const [[alertCount]] = await pool.execute('SELECT COUNT(*) as c FROM fraud_alerts WHERE risk_level IN (?, ?)', ['high', 'critical']);
    const [[vol]] = await pool.execute('SELECT COALESCE(SUM(amount), 0) as v FROM transactions WHERE DATE(created_at) = CURDATE()');
    const [[totalBal]] = await pool.execute('SELECT COALESCE(SUM(balance), 0) as b FROM customers');
    const [[pendingKyc]] = await pool.execute("SELECT COUNT(*) as c FROM customers WHERE kyc_status = 'pending'");
    const [[branchCount]] = await pool.execute('SELECT COUNT(*) as c FROM branches');
    const [[pendingApprovals]] = await pool.execute("SELECT COUNT(*) as c FROM approval_requests WHERE status = 'pending'");
    const [[openDisputes]] = await pool.execute("SELECT COUNT(*) as c FROM disputes WHERE status = 'open'");
    res.json({
      success: true,
      data: {
        totalCustomers: custCount.c,
        totalEmployees: empCount.c,
        todayTransactions: txnCount.c,
        highRiskAlerts: alertCount.c,
        todayVolume: parseFloat(vol.v),
        totalDeposits: parseFloat(totalBal.b),
        pendingKyc: pendingKyc.c,
        totalBranches: branchCount.c,
        pendingApprovals: pendingApprovals.c,
        openDisputes: openDisputes.c,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployees = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.*, b.name as branch_name FROM employees e 
       LEFT JOIN branches b ON e.branch_id = b.id 
       ORDER BY e.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status, branchId } = req.body;
    await pool.execute(
      'UPDATE employees SET name=?, email=?, phone=?, role=?, status=?, branch_id=? WHERE id=?',
      [name, email, phone, role, status, branchId || null, id]
    );
    await logAudit(req.adminId, 'update_employee', 'employee', id, { name, role }, req.ip);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, account_number, name, email, phone, balance, kyc_status, status, created_at FROM customers ORDER BY created_at DESC'
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, kycStatus } = req.body;
    await pool.execute('UPDATE customers SET status=?, kyc_status=? WHERE id=?', [status, kycStatus, id]);
    await logAudit(req.adminId, 'update_customer', 'customer', id, { status, kycStatus }, req.ip);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSuspiciousActivities = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT fa.*, c.account_number, c.name as customer_name FROM fraud_alerts fa 
       JOIN customers c ON fa.customer_id = c.id 
       ORDER BY fa.created_at DESC LIMIT 100`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAnalyticsTransactions = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const [rows] = await pool.execute(
      `SELECT DATE(created_at) as date, COUNT(*) as count, SUM(amount) as volume 
       FROM transactions 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY) 
       GROUP BY DATE(created_at) 
       ORDER BY date`,
      [parseInt(days, 10) || 7]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAnalyticsExpenses = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT category, SUM(amount) as total FROM transactions 
       WHERE type = 'debit' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
       GROUP BY category ORDER BY total DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAnalyticsRisks = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT risk_level, COUNT(*) as count FROM fraud_alerts 
       WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY) 
       GROUP BY risk_level`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLogs = async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const lim = Math.min(parseInt(limit, 10) || 100, 500);
    const [rows] = await pool.execute(
      `SELECT al.*, a.name as admin_name FROM audit_logs al 
       LEFT JOIN admins a ON al.admin_id = a.id 
       ORDER BY al.created_at DESC LIMIT ${lim}`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSettings = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT setting_key, setting_value FROM system_settings');
    const settings = {};
    rows.forEach((r) => { settings[r.setting_key] = r.setting_value; });
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await pool.execute(
        'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
        [key, String(value), String(value)]
      );
    }
    await logAudit(req.adminId, 'update_settings', 'system', null, { keys: Object.keys(settings) }, req.ip);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const triggerBackup = async (req, res) => {
  try {
    await logAudit(req.adminId, 'backup_triggered', 'system', null, null, req.ip);
    res.json({ success: true, message: 'Backup initiated (placeholder - implement actual backup)' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBranches = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, address, city, phone FROM branches');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
