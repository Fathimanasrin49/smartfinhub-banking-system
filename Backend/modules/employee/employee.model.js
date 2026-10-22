import pool from '../../config/database.js';

export const getEmployeeById = async (id) => {
  const idNum = id == null ? null : parseInt(id, 10);
  if (idNum == null || isNaN(idNum)) return null;
  const [rows] = await pool.execute(
    'SELECT id, employee_id, name, email, phone, branch_id, role, designation, status FROM employees WHERE id = ?',
    [idNum]
  );
  return rows[0];
};

export const getAllCustomers = async (filters = {}) => {
  let query = 'SELECT id, account_number, name, email, phone, balance, kyc_status, status, created_at FROM customers WHERE 1=1';
  const params = [];
  if (filters.search) {
    query += ' AND (name LIKE ? OR email LIKE ? OR account_number LIKE ?)';
    const s = `%${filters.search}%`;
    params.push(s, s, s);
  }
  if (filters.kyc_status) {
    query += ' AND kyc_status = ?';
    params.push(filters.kyc_status);
  }
  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }
  query += ' ORDER BY created_at DESC';
  const limit = Math.min(parseInt(filters.limit, 10) || 50, 500);
  query += ` LIMIT ${limit}`;
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getCustomerById = async (id) => {
  const [rows] = await pool.execute(
    'SELECT * FROM customers WHERE id = ?',
    [id]
  );
  return rows[0];
};

export const getCustomerByAccountNumber = async (accountNumber) => {
  const [rows] = await pool.execute(
    'SELECT * FROM customers WHERE account_number = ?',
    [accountNumber]
  );
  return rows[0];
};

export const createCustomer = async (data) => {
  const accountNumber = 'ACC' + Date.now().toString().slice(-8);
  const [result] = await pool.execute(
    `INSERT INTO customers (account_number, name, email, phone, address, password, balance, kyc_status) 
     VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
    [
      accountNumber,
      data.name,
      data.email,
      data.phone,
      data.address || '',
      data.password,
      data.kyc_status || 'pending',
    ]
  );
  const [rows] = await pool.execute(
    'SELECT id, account_number, name, email, phone, status, kyc_status, created_at FROM customers WHERE id = ?',
    [result.insertId]
  );
  return rows[0];
};

export const updateCustomer = async (id, data) => {
  const allowed = ['name', 'phone', 'address', 'status'];
  const updates = [];
  const params = [];
  for (const k of allowed) {
    if (data[k] !== undefined) {
      updates.push(`${k} = ?`);
      params.push(data[k]);
    }
  }
  if (updates.length === 0) return null;
  params.push(id);
  await pool.execute(`UPDATE customers SET ${updates.join(', ')} WHERE id = ?`, params);
  return getCustomerById(id);
};

export const updateCustomerKyc = async (id, kyc_status, rejectReason = null) => {
  await pool.execute('UPDATE customers SET kyc_status = ? WHERE id = ?', [kyc_status, id]);
  return getCustomerById(id);
};

export const getTransactions = async (filters = {}) => {
  let query = `
    SELECT t.id, t.transaction_id, t.sender_account, t.receiver_account, t.amount, t.type, t.category, t.description, t.status, t.created_at
    FROM transactions t
    WHERE 1=1
  `;
  const params = [];
  if (filters.accountNumber) {
    query += ' AND (t.sender_account = ? OR t.receiver_account = ?)';
    params.push(filters.accountNumber, filters.accountNumber);
  }
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

export const getPendingApprovals = async () => {
  const [rows] = await pool.execute(
    `SELECT ar.*, c.account_number, c.name as customer_name, c.email as customer_email
     FROM approval_requests ar
     JOIN customers c ON ar.customer_id = c.id
     WHERE ar.status = 'pending'
     ORDER BY ar.created_at ASC`
  );
  return rows;
};

export const getApprovalById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT ar.*, c.account_number, c.name as customer_name, c.email, c.balance
     FROM approval_requests ar
     JOIN customers c ON ar.customer_id = c.id
     WHERE ar.id = ?`,
    [id]
  );
  return rows[0];
};

export const createApprovalRequest = async (type, customerId, amount, description = null) => {
  const [result] = await pool.execute(
    'INSERT INTO approval_requests (type, customer_id, amount, description, status) VALUES (?, ?, ?, ?, ?)',
    [type, customerId, amount, description, 'pending']
  );
  return result.insertId;
};

export const resolveApproval = async (id, status, employeeId, rejectionReason = null) => {
  await pool.execute(
    'UPDATE approval_requests SET status = ?, resolved_by = ?, resolved_at = NOW(), rejection_reason = ? WHERE id = ?',
    [status, employeeId, rejectionReason, id]
  );
  return getApprovalById(id);
};

export const getBranchTokens = async (branchId, status = 'waiting') => {
  let query = `SELECT bt.*, c.name as customer_name, c.account_number, b.name as branch_name
     FROM branch_tokens bt
     JOIN customers c ON bt.customer_id = c.id
     JOIN branches b ON bt.branch_id = b.id
     WHERE bt.branch_id = ?`;
  const params = [branchId];
  if (status && status !== 'all') {
    query += ' AND bt.status = ?';
    params.push(status);
  }
  query += " ORDER BY CASE WHEN bt.status = 'waiting' THEN 0 ELSE 1 END, bt.created_at ASC";
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getAllTokens = async (status = 'waiting') => {
  let query = `SELECT bt.*, c.name as customer_name, c.account_number, b.name as branch_name
     FROM branch_tokens bt
     JOIN customers c ON bt.customer_id = c.id
     JOIN branches b ON bt.branch_id = b.id
     WHERE 1=1`;
  const params = [];
  if (status && status !== 'all') {
    query += ' AND bt.status = ?';
    params.push(status);
  }
  query += " ORDER BY CASE WHEN bt.status = 'waiting' THEN 0 ELSE 1 END, bt.created_at ASC";
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getTokenByIdForBranch = async (tokenId, branchId) => {
  const [rows] = await pool.execute(
    `SELECT bt.*, c.name as customer_name, c.account_number, b.name as branch_name
     FROM branch_tokens bt
     JOIN customers c ON bt.customer_id = c.id
     JOIN branches b ON bt.branch_id = b.id
     WHERE bt.id = ? AND bt.branch_id = ?`,
    [tokenId, branchId]
  );
  return rows[0];
};

export const getTokenById = async (tokenId) => {
  const [rows] = await pool.execute(
    `SELECT bt.*, c.name as customer_name, c.account_number, b.name as branch_name
     FROM branch_tokens bt
     JOIN customers c ON bt.customer_id = c.id
     JOIN branches b ON bt.branch_id = b.id
     WHERE bt.id = ?`,
    [tokenId]
  );
  return rows[0];
};

export const updateTokenStatus = async (tokenId, status) => {
  await pool.execute('UPDATE branch_tokens SET status = ? WHERE id = ?', [status, tokenId]);
  const [rows] = await pool.execute(
    `SELECT bt.*, c.name as customer_name, c.account_number, b.name as branch_name
     FROM branch_tokens bt
     JOIN customers c ON bt.customer_id = c.id
     JOIN branches b ON bt.branch_id = b.id
     WHERE bt.id = ?`,
    [tokenId]
  );
  return rows[0];
};

export const getServiceRequests = async (filters = {}) => {
  let query = `
    SELECT sr.*, c.name as customer_name, c.account_number
    FROM service_requests sr
    JOIN customers c ON sr.customer_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (filters.branch_id) {
    query += ' AND (sr.branch_id = ? OR sr.branch_id IS NULL)';
    params.push(filters.branch_id);
  }
  if (filters.status) {
    query += ' AND sr.status = ?';
    params.push(filters.status);
  }
  if (filters.assigned_to) {
    query += ' AND sr.assigned_to = ?';
    params.push(filters.assigned_to);
  }
  query += ' ORDER BY sr.created_at DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getServiceRequestById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT sr.*, c.name as customer_name, c.account_number, c.email
     FROM service_requests sr
     JOIN customers c ON sr.customer_id = c.id
     WHERE sr.id = ?`,
    [id]
  );
  return rows[0];
};

export const assignServiceRequest = async (id, employeeId) => {
  await pool.execute(
    'UPDATE service_requests SET assigned_to = ?, status = ? WHERE id = ?',
    [employeeId, 'in_progress', id]
  );
  return getServiceRequestById(id);
};

export const resolveServiceRequest = async (id, notes) => {
  await pool.execute(
    'UPDATE service_requests SET status = ?, resolution_notes = ?, resolved_at = NOW() WHERE id = ?',
    ['resolved', notes, id]
  );
  return getServiceRequestById(id);
};

export const getFeedback = async (filters = {}) => {
  let query = `
    SELECT f.*, c.name as customer_name
    FROM feedback f
    JOIN customers c ON f.customer_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (filters.branch_id) {
    query += ' AND f.branch_id = ?';
    params.push(filters.branch_id);
  }
  query += ' ORDER BY f.created_at DESC LIMIT 100';
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getDisputes = async (filters = {}) => {
  let query = `
    SELECT d.*, c.name as customer_name, c.account_number, t.transaction_id as txn_id, t.amount as txn_amount
    FROM disputes d
    JOIN customers c ON d.customer_id = c.id
    LEFT JOIN transactions t ON d.transaction_id = t.id
    WHERE 1=1
  `;
  const params = [];
  if (filters.status) {
    query += ' AND d.status = ?';
    params.push(filters.status);
  }
  query += ' ORDER BY d.created_at DESC';
  const [rows] = await pool.execute(query, params);
  return rows;
};

export const getDisputeById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT d.*, c.name as customer_name, c.account_number, c.email, t.transaction_id, t.amount, t.type, t.description
     FROM disputes d
     JOIN customers c ON d.customer_id = c.id
     LEFT JOIN transactions t ON d.transaction_id = t.id
     WHERE d.id = ?`,
    [id]
  );
  return rows[0];
};

export const resolveDispute = async (id, status, employeeId, resolutionNotes) => {
  await pool.execute(
    'UPDATE disputes SET status = ?, resolved_by = ?, resolution_notes = ?, resolved_at = NOW() WHERE id = ?',
    [status, employeeId, resolutionNotes, id]
  );
  return getDisputeById(id);
};

export const createDispute = async (customerId, transactionId, reason) => {
  const [result] = await pool.execute(
    'INSERT INTO disputes (customer_id, transaction_id, reason, status) VALUES (?, ?, ?, ?)',
    [customerId, transactionId, reason, 'open']
  );
  return result.insertId;
};

export const getDashboardStats = async (branchId) => {
  const today = new Date().toISOString().slice(0, 10);
  const branchIdNum = branchId != null && branchId !== '' ? parseInt(branchId, 10) : null;
  const hasBranch = branchIdNum != null && !isNaN(branchIdNum);

  const [dailyTxns] = await pool.execute(
    `SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
     FROM transactions
     WHERE DATE(created_at) = ?`,
    [today]
  );
  const [pendingApprovals] = await pool.execute(
    'SELECT COUNT(*) as count FROM approval_requests WHERE status = ?',
    ['pending']
  );
  const [fraudAlerts] = await pool.execute(
    `SELECT COUNT(*) as count FROM fraud_alerts fa
     WHERE fa.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
     AND fa.risk_level IN ('high', 'critical')`
  );
  const [queueWaiting] = hasBranch
    ? await pool.execute('SELECT COUNT(*) as count FROM branch_tokens WHERE branch_id = ? AND status = ?', [branchIdNum, 'waiting'])
    : [[{ count: 0 }]];
  const [openRequests] = hasBranch
    ? await pool.execute(
        'SELECT COUNT(*) as count FROM service_requests WHERE (branch_id = ? OR branch_id IS NULL) AND status IN (?, ?)',
        [branchIdNum, 'open', 'in_progress']
      )
    : [[{ count: 0 }]];
  const [openDisputes] = await pool.execute(
    'SELECT COUNT(*) as count FROM disputes WHERE status = ?',
    ['open']
  );

  return {
    dailyTransactions: { count: dailyTxns[0].count, total: parseFloat(dailyTxns[0].total) },
    pendingApprovals: pendingApprovals[0].count,
    fraudAlerts: fraudAlerts[0].count,
    queueWaiting: queueWaiting[0].count,
    openServiceRequests: openRequests[0].count,
    openDisputes: openDisputes[0].count,
  };
};

export const getBranches = async () => {
  const [rows] = await pool.execute('SELECT id, name, address, city, phone FROM branches');
  return rows;
};
