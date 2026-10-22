import {
  getProfile,
  getBalance,
  deposit,
  withdraw,
  transfer,
  getCustomerTransactions,
  getExpenseSummary,
  runAIFraudAnalysis,
} from './customer.service.js';
import {
  findCustomerById,
  getTransactionById,
  getFraudAlerts,
  getBranchTokens,
  createServiceRequest,
  createFeedback,
  createDispute,
  upsertNotification,
  getCustomerNotifications,
} from './customer.model.js';
import pool from '../../config/database.js';
import QRCode from 'qrcode';
import { getFraudAlertExplanation } from './gemini.service.js';

export const profile = async (req, res) => {
  try {
    const profileData = await getProfile(req.customerId);
    if (!profileData) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: profileData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const balance = async (req, res) => {
  try {
    const data = await getBalance(req.customerId);
    if (!data) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const depositMoney = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const amt = parseFloat(amount);
    if (!amount || amt <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    const result = await deposit(req.customerId, amt, description || 'Cash Deposit');
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const withdrawMoney = async (req, res) => {
  try {
    const { amount, description } = req.body;
    const amt = parseFloat(amount);
    if (!amount || amt <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }
    const result = await withdraw(req.customerId, amt, description || 'Cash Withdrawal');
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const transferFunds = async (req, res) => {
  try {
    const { receiverAccount, amount, description } = req.body;
    const amt = parseFloat(amount);
    if (!receiverAccount || !amount || amt <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid receiver or amount' });
    }
    const result = await transfer(req.customerId, receiverAccount.trim(), amt, description || 'Fund Transfer');
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const transactions = async (req, res) => {
  try {
    const customer = await findCustomerById(req.customerId);
    if (!customer) return res.status(404).json({ success: false, message: 'Account not found' });

    const { type, startDate, endDate, limit } = req.query;
    const filters = {};
    if (type) filters.type = type;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (limit) filters.limit = parseInt(limit, 10) || 50;

    const data = await getCustomerTransactions(customer.account_number, filters);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const transactionById = async (req, res) => {
  try {
    const customer = await findCustomerById(req.customerId);
    if (!customer) return res.status(404).json({ success: false, message: 'Account not found' });

    const txn = await getTransactionById(req.params.id, customer.account_number);
    if (!txn) return res.status(404).json({ success: false, message: 'Transaction not found' });
    res.json({ success: true, data: txn });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const downloadStatement = async (req, res) => {
  try {
    const customer = await findCustomerById(req.customerId);
    if (!customer) return res.status(404).json({ success: false, message: 'Account not found' });

    const { startDate, endDate } = req.query;
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10);
    const end = endDate || new Date().toISOString().slice(0, 10);

    const { getTransactions } = await import('./customer.model.js');
    const txns = await getTransactions(customer.account_number, { startDate: start, endDate: end });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=statement-${customer.account_number}-${start}-${end}.json`);
    res.json({
      account: customer.account_number,
      name: customer.name,
      period: { start, end },
      transactions: txns,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const alerts = async (req, res) => {
  try {
    await runAIFraudAnalysis(req.customerId);
    const [fraudAlerts, customer, tokens] = await Promise.all([
      getFraudAlerts(req.customerId),
      findCustomerById(req.customerId),
      getBranchTokens(req.customerId),
    ]);

    // 1) Low balance notification (persisted once per day)
    const lowBalanceThreshold = 500;
    const currentBalance = Number(customer?.balance || 0);
    if (customer && currentBalance < lowBalanceThreshold) {
      const today = new Date().toISOString().slice(0, 10);
      await upsertNotification({
        customerId: req.customerId,
        notificationType: 'low_balance',
        referenceId: `low_balance_${today}`,
        riskLevel: 'medium',
        message: `Your account balance is below ₹${lowBalanceThreshold}. Current balance: ₹${currentBalance.toLocaleString('en-IN')}.`,
        aiMessage: `Low balance alert: your account balance is ₹${currentBalance.toLocaleString('en-IN')}. Please add funds to avoid failed transactions.`,
        createdAt: new Date().toISOString(),
      });
    }

    // 2) Token called notifications (persisted per token)
    const servedTokens = (tokens || []).filter((t) => t.status === 'served').slice(0, 3);
    for (const t of servedTokens) {
      await upsertNotification({
        customerId: req.customerId,
        notificationType: 'token_called',
        referenceId: `token_called_${t.id}`,
        riskLevel: 'low',
        message: `Your token ${t.token_number} at ${t.branch_name} has been called.`,
        aiMessage: `Queue update: your token ${t.token_number} at ${t.branch_name} has been called. Please proceed to the counter.`,
        createdAt: t.created_at,
      });
    }

    // 3) Fraud alert notifications (persisted per fraud_alerts row)
    for (const a of fraudAlerts || []) {
      let aiMessage = '';
      try {
        aiMessage = await getFraudAlertExplanation(a.message || '');
      } catch (e) {
        aiMessage = '';
      }
      await upsertNotification({
        customerId: req.customerId,
        notificationType: 'fraud_alert',
        referenceId: `fraud_${a.id}`,
        riskLevel: a.risk_level,
        message: a.message || '',
        aiMessage: aiMessage || a.message || '',
        createdAt: a.created_at,
      });
    }

    const notifications = await getCustomerNotifications(req.customerId, 50);
    res.json({ success: true, data: notifications || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const expensesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const end = endDate || new Date().toISOString().slice(0, 10);
    const start = startDate || new Date(new Date().setDate(1)).toISOString().slice(0, 10);
    const data = await getExpenseSummary(req.customerId, start, end);
    res.json({ success: true, data: data || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const expenseInsights = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const end = endDate || new Date().toISOString().slice(0, 10);
    const start = startDate || new Date(new Date().setDate(1)).toISOString().slice(0, 10);
    const summary = await getExpenseSummary(req.customerId, start, end);
    const { getExpenseInsights } = await import('./gemini.service.js');
    const insights = await getExpenseInsights(summary || {});
    res.json({ success: true, data: { summary: summary || {}, insights } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const generateToken = async (req, res) => {
  try {
    const branchId = parseInt(req.body?.branchId, 10);
    if (!branchId || Number.isNaN(branchId)) {
      return res.status(400).json({ success: false, message: 'Branch ID required' });
    }

    const [[branch]] = await pool.execute('SELECT id FROM branches WHERE id = ?', [branchId]);
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });

    const [existingRows] = await pool.execute(
      `SELECT id, token_number
       FROM branch_tokens
       WHERE customer_id = ? AND branch_id = ? AND status = 'waiting' AND DATE(created_at) = CURDATE()
       ORDER BY created_at DESC
       LIMIT 1`,
      [req.customerId, branchId]
    );
    if (existingRows.length) {
      return res.status(409).json({
        success: false,
        message: `You already have an active waiting token (${existingRows[0].token_number}) for this branch today.`,
      });
    }

    const [countRows] = await pool.execute(
      'SELECT COUNT(*) + 1 as next FROM branch_tokens WHERE branch_id = ? AND DATE(created_at) = CURDATE()',
      [branchId]
    );
    const nextNum = countRows[0]?.next || 1;
    const tokenNumber = `TKN-${String(nextNum).padStart(4, '0')}`;

    const [result] = await pool.execute(
      'INSERT INTO branch_tokens (customer_id, token_number, branch_id) VALUES (?, ?, ?)',
      [req.customerId, tokenNumber, branchId]
    );

    const [rows] = await pool.execute(
      'SELECT bt.*, b.name as branch_name FROM branch_tokens bt JOIN branches b ON bt.branch_id = b.id WHERE bt.id = ?',
      [result.insertId]
    );
    const token = rows[0];
    const [[positionRow]] = await pool.execute(
      `SELECT COUNT(*) as queue_position
       FROM branch_tokens
       WHERE branch_id = ? AND status = 'waiting' AND DATE(created_at) = CURDATE() AND created_at <= ?`,
      [branchId, token.created_at]
    );
    const qrData = JSON.stringify({
      tokenId: token.id,
      tokenNumber: token.token_number,
      customerId: req.customerId,
      branchId: token.branch_id,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    res.json({
      success: true,
      data: {
        ...token,
        queue_position: positionRow?.queue_position || 1,
        qrCode: qrCodeDataUrl,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const tokenStatus = async (req, res) => {
  try {
    const data = await getBranchTokens(req.customerId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const signup = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, phone and password required' });
    }
    const [existing] = await pool.execute('SELECT id FROM customers WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const accountNumber = 'ACC' + Date.now().toString().slice(-8);
    const [result] = await pool.execute(
      'INSERT INTO customers (account_number, name, email, phone, password, balance, kyc_status) VALUES (?, ?, ?, ?, ?, 0, ?)',
      [accountNumber, name.trim(), email.trim(), phone.trim(), password, 'pending']
    );
    const [rows] = await pool.execute(
      'SELECT id, account_number, name, email, status FROM customers WHERE id = ?',
      [result.insertId]
    );
    res.status(201).json({ success: true, data: rows[0] });
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

    const [rows] = await pool.execute(
      'SELECT id, account_number, name, email, status FROM customers WHERE email = ? AND password = ?',
      [email, password]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const customer = rows[0];
    if (customer.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Account is not active' });
    }
    res.json({ success: true, data: customer });
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

export const submitServiceRequest = async (req, res) => {
  try {
    const { type, subject, description, branchId } = req.body;
    if (!subject || !subject.trim()) {
      return res.status(400).json({ success: false, message: 'Subject required' });
    }
    const id = await createServiceRequest(
      req.customerId,
      type || 'general',
      subject.trim(),
      description || '',
      branchId || null
    );
    res.status(201).json({ success: true, data: { id, message: 'Service request submitted' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitFeedback = async (req, res) => {
  try {
    const { rating, message, branchId } = req.body;
    const r = parseInt(rating, 10);
    if (isNaN(r) || r < 1 || r > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });
    }
    const id = await createFeedback(req.customerId, r, message || '', branchId || null);
    res.status(201).json({ success: true, data: { id, message: 'Feedback submitted' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitDispute = async (req, res) => {
  try {
    const { transactionId, reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'Reason required' });
    }
    const id = await createDispute(req.customerId, transactionId || null, reason.trim());
    res.status(201).json({ success: true, data: { id, message: 'Dispute submitted' } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPendingApprovals = async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT ar.id, ar.type, ar.amount, ar.description, ar.status, ar.created_at
       FROM approval_requests ar
       WHERE ar.customer_id = ? AND ar.status = 'pending'
       ORDER BY ar.created_at DESC`,
      [req.customerId]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
