import pool from '../../config/database.js';
import { getApprovalById } from './employee.model.js';
import { categorizeDescription } from '../../utils/categoryMap.js';
import { generateTransactionId } from '../../utils/uuid.js';

export const executeDepositApproval = async (approvalId, employeeId) => {
  const approval = await getApprovalById(approvalId);
  if (!approval || approval.status !== 'pending' || approval.type !== 'deposit') {
    throw new Error('Invalid or already processed approval');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [customers] = await connection.execute(
      'SELECT id, account_number, balance FROM customers WHERE id = ?',
      [approval.customer_id]
    );
    if (!customers.length) throw new Error('Customer not found');

    const customer = customers[0];
    const amount = parseFloat(approval.amount);
    const newBalance = parseFloat(customer.balance) + amount;
    const txnId = generateTransactionId();
    const description = approval.description || 'Cash Deposit';
    const category = categorizeDescription(description);

    await connection.execute(
      'UPDATE customers SET balance = ? WHERE id = ?',
      [newBalance, approval.customer_id]
    );
    await connection.execute(
      `INSERT INTO transactions (transaction_id, receiver_account, amount, type, category, description, status) 
       VALUES (?, ?, ?, 'credit', ?, ?, 'completed')`,
      [txnId, customer.account_number, amount, category, description]
    );

    await connection.execute(
      'UPDATE approval_requests SET status = ?, resolved_by = ?, resolved_at = NOW() WHERE id = ?',
      ['approved', employeeId, approvalId]
    );

    await connection.commit();
    return { newBalance, transactionId: txnId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const executeWithdrawApproval = async (approvalId, employeeId) => {
  const approval = await getApprovalById(approvalId);
  if (!approval || approval.status !== 'pending' || approval.type !== 'withdraw') {
    throw new Error('Invalid or already processed approval');
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [customers] = await connection.execute(
      'SELECT id, account_number, balance FROM customers WHERE id = ?',
      [approval.customer_id]
    );
    if (!customers.length) throw new Error('Customer not found');

    const customer = customers[0];
    const amount = parseFloat(approval.amount);
    const currentBalance = parseFloat(customer.balance);
    if (amount > currentBalance) throw new Error('Insufficient balance');

    const newBalance = currentBalance - amount;
    const txnId = generateTransactionId();
    const description = approval.description || 'Cash Withdrawal';
    const category = categorizeDescription(description);

    await connection.execute(
      'UPDATE customers SET balance = ? WHERE id = ?',
      [newBalance, approval.customer_id]
    );
    await connection.execute(
      `INSERT INTO transactions (transaction_id, sender_account, amount, type, category, description, status) 
       VALUES (?, ?, ?, 'debit', ?, ?, 'completed')`,
      [txnId, customer.account_number, amount, category, description]
    );

    await connection.execute(
      'UPDATE approval_requests SET status = ?, resolved_by = ?, resolved_at = NOW() WHERE id = ?',
      ['approved', employeeId, approvalId]
    );

    await connection.commit();
    return { newBalance, transactionId: txnId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const executeBranchDeposit = async (customerId, amount, description, employeeId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [customers] = await connection.execute(
      'SELECT id, account_number, balance FROM customers WHERE id = ?',
      [customerId]
    );
    if (!customers.length) throw new Error('Customer not found');

    const customer = customers[0];
    const amt = parseFloat(amount);
    const newBalance = parseFloat(customer.balance) + amt;
    const txnId = generateTransactionId();
    const cat = categorizeDescription(description || 'Branch Deposit');

    await connection.execute(
      'UPDATE customers SET balance = ? WHERE id = ?',
      [newBalance, customerId]
    );
    await connection.execute(
      `INSERT INTO transactions (transaction_id, receiver_account, amount, type, category, description, status) 
       VALUES (?, ?, ?, 'credit', ?, ?, 'completed')`,
      [txnId, customer.account_number, amt, cat, description || 'Branch Deposit']
    );

    await connection.commit();
    return { newBalance, transactionId: txnId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};

export const executeBranchWithdraw = async (customerId, amount, description, employeeId) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [customers] = await connection.execute(
      'SELECT id, account_number, balance FROM customers WHERE id = ?',
      [customerId]
    );
    if (!customers.length) throw new Error('Customer not found');

    const customer = customers[0];
    const amt = parseFloat(amount);
    const currentBalance = parseFloat(customer.balance);
    if (amt > currentBalance) throw new Error('Insufficient balance');

    const newBalance = currentBalance - amt;
    const txnId = generateTransactionId();
    const cat = categorizeDescription(description || 'Branch Withdrawal');

    await connection.execute(
      'UPDATE customers SET balance = ? WHERE id = ?',
      [newBalance, customerId]
    );
    await connection.execute(
      `INSERT INTO transactions (transaction_id, sender_account, amount, type, category, description, status) 
       VALUES (?, ?, ?, 'debit', ?, ?, 'completed')`,
      [txnId, customer.account_number, amt, cat, description || 'Branch Withdrawal']
    );

    await connection.commit();
    return { newBalance, transactionId: txnId };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
};
