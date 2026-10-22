import pool from '../../config/database.js';
import {
  findCustomerById,
  findCustomerByAccountNumber,
  getTransactions,
  createFraudAlert,
  createApprovalRequest,
} from './customer.model.js';
import { categorizeDescription } from '../../utils/categoryMap.js';
import { generateTransactionId } from '../../utils/uuid.js';
import { analyzeTransactionsForFraud } from './gemini.service.js';

export const getProfile = async (customerId) => {
  return findCustomerById(customerId);
};

export const getBalance = async (customerId) => {
  const customer = await findCustomerById(customerId);
  return customer ? { balance: parseFloat(customer.balance) } : null;
};

export const deposit = async (customerId, amount, description = 'Cash Deposit') => {
  const customer = await findCustomerById(customerId);
  if (!customer) throw new Error('Account not found');
  const amt = parseFloat(amount);
  if (amt <= 0) throw new Error('Invalid amount');
  const approvalId = await createApprovalRequest('deposit', customerId, amt, description);
  return { success: true, approvalId, message: 'Deposit request submitted for approval', pending: true };
};

export const withdraw = async (customerId, amount, description = 'Cash Withdrawal') => {
  const customer = await findCustomerById(customerId);
  if (!customer) throw new Error('Account not found');
  const amt = parseFloat(amount);
  if (amt <= 0) throw new Error('Invalid amount');
  const currentBalance = parseFloat(customer.balance);
  if (amt > currentBalance) throw new Error('Insufficient balance');
  const approvalId = await createApprovalRequest('withdraw', customerId, amt, description);
  return { success: true, approvalId, message: 'Withdrawal request submitted for approval', pending: true };
};

export const transfer = async (customerId, receiverAccount, amount, description = 'Fund Transfer') => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [senders] = await connection.execute(
      'SELECT id, account_number, balance, kyc_status FROM customers WHERE id = ?',
      [customerId]
    );
    const [receivers] = await connection.execute(
      'SELECT id, account_number, balance FROM customers WHERE account_number = ? AND status = ?',
      [receiverAccount, 'active']
    );

    if (!senders.length) throw new Error('Sender account not found');
    if (senders[0].kyc_status === 'rejected') {
      throw new Error('Transfers are not allowed. Your KYC has been rejected by the bank. Please contact your branch.');
    }
    if (!receivers.length) throw new Error('Receiver account not found');
    if (senders[0].account_number === receiverAccount) throw new Error('Cannot transfer to same account');

    const sender = senders[0];
    const receiver = receivers[0];
    const transferAmount = parseFloat(amount);
    const senderBalance = parseFloat(sender.balance);

    if (transferAmount > senderBalance) throw new Error('Insufficient balance');
    if (transferAmount <= 0) throw new Error('Invalid amount');

    const senderNewBalance = senderBalance - transferAmount;
    const receiverNewBalance = parseFloat(receiver.balance) + transferAmount;
    const txnId = generateTransactionId();

    await connection.execute(
      'UPDATE customers SET balance = ? WHERE id = ?',
      [senderNewBalance, customerId]
    );
    await connection.execute(
      'UPDATE customers SET balance = ? WHERE id = ?',
      [receiverNewBalance, receiver.id]
    );

    await connection.execute(
      `INSERT INTO transactions (transaction_id, sender_account, receiver_account, amount, type, category, description, status) 
       VALUES (?, ?, ?, ?, 'debit', 'transfer', ?, 'completed')`,
      [txnId, sender.account_number, receiverAccount, amount, description]
    );
    const [debitResult] = await connection.execute('SELECT LAST_INSERT_ID() as id');
    const debitTxnId = debitResult[0].id;

    await connection.execute(
      `INSERT INTO transactions (transaction_id, sender_account, receiver_account, amount, type, category, description, status) 
       VALUES (?, ?, ?, ?, 'credit', 'transfer', ?, 'completed')`,
      [txnId + '-CR', sender.account_number, receiverAccount, amount, description]
    );

    await runFraudChecks(connection, customerId, debitTxnId, amount, 'transfer', receiverAccount);

    await connection.commit();
    return { success: true, newBalance: senderNewBalance, transactionId: txnId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

async function runFraudChecks(connection, customerId, txnId, amount, type, receiverAccount = null) {
  const amt = parseFloat(amount);
  if (amt > 50000) {
    await connection.execute(
      'INSERT INTO fraud_alerts (customer_id, transaction_id, risk_level, message) VALUES (?, ?, ?, ?)',
      [customerId, txnId, 'high', `Large transaction of ₹${amt.toLocaleString()} flagged`]
    );
  }

  const [recentTxns] = await connection.execute(
    'SELECT COUNT(*) as cnt FROM transactions WHERE sender_account = (SELECT account_number FROM customers WHERE id = ?) AND created_at > DATE_SUB(NOW(), INTERVAL 1 MINUTE)',
    [customerId]
  );
  if (recentTxns[0].cnt >= 3) {
    await connection.execute(
      'INSERT INTO fraud_alerts (customer_id, transaction_id, risk_level, message) VALUES (?, ?, ?, ?)',
      [customerId, txnId, 'medium', 'Multiple transactions in 1 minute - possible unusual activity']
    );
  }

  if (type === 'transfer' && receiverAccount) {
    const [priorTransfers] = await connection.execute(
      'SELECT COUNT(*) as cnt FROM transactions WHERE sender_account = (SELECT account_number FROM customers WHERE id = ?) AND receiver_account = ?',
      [customerId, receiverAccount]
    );
    if (priorTransfers[0].cnt <= 1) {
      await connection.execute(
        'INSERT INTO fraud_alerts (customer_id, transaction_id, risk_level, message) VALUES (?, ?, ?, ?)',
        [customerId, txnId, 'low', `First-time transfer to account ${receiverAccount}`]
      );
    }
  }
}

export const getCustomerTransactions = (accountNumber, filters) => {
  return getTransactions(accountNumber, filters);
};

/** Run AI (Gemini) fraud analysis on recent transactions and persist new alerts */
export const runAIFraudAnalysis = async (customerId) => {
  const customer = await findCustomerById(customerId);
  if (!customer) return;

  const recentTxns = await getTransactions(customer.account_number, { limit: 25 });
  if (recentTxns.length === 0) return;

  const alerts = await analyzeTransactionsForFraud(customer.account_number, recentTxns);
  for (const a of alerts) {
    await createFraudAlert(customerId, a.transaction_id, a.risk_level, a.message);
  }
};

export const getExpenseSummary = async (customerId, startDate, endDate) => {
  const customer = await findCustomerById(customerId);
  if (!customer) return null;

  const { getExpenseSummary: getSummary } = await import('./customer.model.js');
  const rows = await getSummary(customer.account_number, startDate, endDate);
  const summary = {};
  rows.forEach((r) => {
    summary[r.category] = parseFloat(r.total);
  });
  return summary;
};
