import pool from '../../config/database.js';

export const findCustomerById = async (id) => {
  const idNum = id == null ? null : parseInt(id, 10);
  if (idNum == null || isNaN(idNum)) return null;
  const [rows] = await pool.execute(
    'SELECT id, account_number, name, email, phone, balance, kyc_status, status, created_at FROM customers WHERE id = ?',
    [idNum]
  );
  return rows[0];
};

export const findCustomerByAccountNumber = async (accountNumber) => {
  const [rows] = await pool.execute(
    'SELECT id, account_number, name, balance, status FROM customers WHERE account_number = ?',
    [accountNumber]
  );
  return rows[0];
};

export const findCustomerByEmail = async (email) => {
  const [rows] = await pool.execute('SELECT * FROM customers WHERE email = ?', [email]);
  return rows[0];
};

export const createOtp = async (customerId, otpCode, expiresAt) => {
  const [result] = await pool.execute(
    'INSERT INTO otps (customer_id, otp_code, expires_at) VALUES (?, ?, ?)',
    [customerId, otpCode, expiresAt]
  );
  return result.insertId;
};

export const getTransactions = async (accountNumber, filters = {}) => {
  let query = `
    SELECT t.id, t.transaction_id, t.sender_account, t.receiver_account, t.amount, 
           t.type, t.category, t.description, t.status, t.created_at
    FROM transactions t 
    WHERE (t.sender_account = ? OR t.receiver_account = ?)
  `;
  const params = [accountNumber, accountNumber];

  if (filters.type) {
    query += ' AND t.type = ?';
    params.push(filters.type);
  }
  if (filters.startDate) {
    query += ' AND DATE(t.created_at) >= ?';
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    query += ' AND DATE(t.created_at) <= ?';
    params.push(filters.endDate);
  }

  query += ' ORDER BY t.created_at DESC';
  const limit = Math.min(parseInt(filters.limit, 10) || 100, 1000);
  query += ` LIMIT ${limit}`;
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getTransactionById = async (id, accountNumber) => {
  const [rows] = await pool.execute(
    `SELECT * FROM transactions 
     WHERE id = ? AND (sender_account = ? OR receiver_account = ?)`,
    [id, accountNumber, accountNumber]
  );
  return rows[0];
};

export const getExpenseSummary = async (accountNumber, startDate, endDate) => {
  const [rows] = await pool.execute(
    `SELECT category, SUM(amount) as total 
     FROM transactions 
     WHERE (sender_account = ? OR receiver_account = ?) 
       AND type = 'debit'
       AND DATE(created_at) >= ? 
       AND DATE(created_at) <= ?
     GROUP BY category`,
    [accountNumber, accountNumber, startDate, endDate]
  );
  return rows;
};

export const getFraudAlerts = async (customerId) => {
  const [rows] = await pool.execute(
    `SELECT fa.*, t.transaction_id, t.amount 
     FROM fraud_alerts fa 
     LEFT JOIN transactions t ON fa.transaction_id = t.id
     WHERE fa.customer_id = ? 
     ORDER BY fa.created_at DESC 
     LIMIT 50`,
    [customerId]
  );
  return rows;
};

export const upsertNotification = async ({
  customerId,
  notificationType,
  referenceId,
  riskLevel = null,
  message = '',
  aiMessage = '',
  createdAt = null,
}) => {
  await pool.execute(
    `INSERT INTO notifications
      (customer_id, notification_type, reference_id, risk_level, message, ai_message, is_read, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, COALESCE(?, NOW()))
     ON DUPLICATE KEY UPDATE
       risk_level = VALUES(risk_level),
       message = VALUES(message),
       ai_message = VALUES(ai_message)`,
    [customerId, notificationType, referenceId, riskLevel, message, aiMessage, createdAt]
  );
};

export const getCustomerNotifications = async (customerId, limit = 50) => {
  const lim = Math.min(parseInt(limit, 10) || 50, 200);
  const [rows] = await pool.execute(
    `SELECT id, notification_type, reference_id, risk_level, message, ai_message, is_read, created_at
     FROM notifications
     WHERE customer_id = ?
     ORDER BY created_at DESC
     LIMIT ${lim}`,
    [customerId]
  );
  return rows;
};

export const createApprovalRequest = async (type, customerId, amount, description = null) => {
  const [result] = await pool.execute(
    'INSERT INTO approval_requests (type, customer_id, amount, description, status) VALUES (?, ?, ?, ?, ?)',
    [type, customerId, amount, description, 'pending']
  );
  return result.insertId;
};

export const createFraudAlert = async (customerId, transactionId, riskLevel, message) => {
  const [result] = await pool.execute(
    'INSERT INTO fraud_alerts (customer_id, transaction_id, risk_level, message) VALUES (?, ?, ?, ?)',
    [customerId, transactionId, riskLevel, message]
  );
  return result.insertId;
};

export const createServiceRequest = async (customerId, type, subject, description, branchId = null) => {
  const [result] = await pool.execute(
    'INSERT INTO service_requests (customer_id, branch_id, type, subject, description, status) VALUES (?, ?, ?, ?, ?, ?)',
    [customerId, branchId, type || 'general', subject, description || '', 'open']
  );
  return result.insertId;
};

export const createFeedback = async (customerId, rating, message, branchId = null) => {
  const [result] = await pool.execute(
    'INSERT INTO feedback (customer_id, branch_id, rating, message) VALUES (?, ?, ?, ?)',
    [customerId, branchId, rating, message || '']
  );
  return result.insertId;
};

export const createDispute = async (customerId, transactionId, reason) => {
  const [result] = await pool.execute(
    'INSERT INTO disputes (customer_id, transaction_id, reason, status) VALUES (?, ?, ?, ?)',
    [customerId, transactionId, reason, 'open']
  );
  return result.insertId;
};

export const getBranchTokens = async (customerId) => {
  const [rows] = await pool.execute(
    `SELECT bt.*, b.name as branch_name, b.address as branch_address 
     FROM branch_tokens bt 
     JOIN branches b ON bt.branch_id = b.id 
     WHERE bt.customer_id = ? 
     ORDER BY bt.created_at DESC 
     LIMIT 10`,
    [customerId]
  );
  return rows;
};
