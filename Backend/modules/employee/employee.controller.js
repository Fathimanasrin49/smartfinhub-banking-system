import * as model from './employee.model.js';
import * as service from './employee.service.js';

export const dashboard = async (req, res) => {
  try {
    const employee = await model.getEmployeeById(req.employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    const stats = await model.getDashboardStats(employee.branch_id || null);
    res.json({ success: true, data: { employee, stats } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCustomers = async (req, res) => {
  try {
    const { search, kyc_status, status, limit } = req.query;
    const filters = {};
    if (search) filters.search = search;
    if (kyc_status) filters.kyc_status = kyc_status;
    if (status) filters.status = status;
    if (limit) filters.limit = parseInt(limit, 10) || 50;
    const data = await model.getAllCustomers(filters);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCustomerById = async (req, res) => {
  try {
    const data = await model.getCustomerById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, address, password, kyc_status } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, phone and password are required' });
    }
    const pool = (await import('../../config/database.js')).default;
    const [byEmail] = await pool.execute('SELECT id FROM customers WHERE email = ?', [email.trim()]);
    if (byEmail.length) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const data = await model.createCustomer({
      name: name.trim(),
      email: email.trim(),
      phone: String(phone).trim(),
      address: (address || '').trim(),
      password,
      kyc_status: kyc_status || 'pending',
    });
    res.status(201).json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const data = await model.updateCustomer(req.params.id, req.body);
    if (!data) return res.status(400).json({ success: false, message: 'Nothing to update' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateCustomerKyc = async (req, res) => {
  try {
    const { kyc_status, reject_reason } = req.body;
    if (!['pending', 'verified', 'rejected'].includes(kyc_status)) {
      return res.status(400).json({ success: false, message: 'Invalid kyc_status' });
    }
    const data = await model.updateCustomerKyc(req.params.id, kyc_status, reject_reason);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCustomerTransactions = async (req, res) => {
  try {
    const customer = await model.getCustomerById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const { type, startDate, endDate, limit } = req.query;
    const filters = { accountNumber: customer.account_number };
    if (type) filters.type = type;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (limit) filters.limit = parseInt(limit, 10) || 100;
    const data = await model.getTransactions(filters);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getApprovals = async (req, res) => {
  try {
    const data = await model.getPendingApprovals();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const approveRequest = async (req, res) => {
  try {
    const approval = await model.getApprovalById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Approval request not found' });
    if (approval.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Already processed' });
    }

    if (approval.type === 'deposit') {
      const result = await service.executeDepositApproval(req.params.id, req.employeeId);
      return res.json({ success: true, data: { ...result, type: 'deposit' } });
    }
    if (approval.type === 'withdraw') {
      const result = await service.executeWithdrawApproval(req.params.id, req.employeeId);
      return res.json({ success: true, data: { ...result, type: 'withdraw' } });
    }
    if (approval.type === 'kyc_update') {
      await model.resolveApproval(req.params.id, 'approved', req.employeeId);
      return res.json({ success: true, data: { type: 'kyc_update' } });
    }

    res.status(400).json({ success: false, message: 'Unknown approval type' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const rejectRequest = async (req, res) => {
  try {
    const { reason } = req.body || {};
    const approval = await model.getApprovalById(req.params.id);
    if (!approval) return res.status(404).json({ success: false, message: 'Approval request not found' });
    if (approval.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Already processed' });
    }
    await model.resolveApproval(req.params.id, 'rejected', req.employeeId, reason || 'Rejected by employee');
    res.json({ success: true, message: 'Request rejected' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const branchDeposit = async (req, res) => {
  try {
    const { customerId, amount, description } = req.body;
    if (!customerId || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid customerId and amount required' });
    }
    const result = await service.executeBranchDeposit(
      parseInt(customerId, 10),
      parseFloat(amount),
      description || 'Branch Deposit',
      req.employeeId
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const branchWithdraw = async (req, res) => {
  try {
    const { customerId, amount, description } = req.body;
    if (!customerId || !amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid customerId and amount required' });
    }
    const result = await service.executeBranchWithdraw(
      parseInt(customerId, 10),
      parseFloat(amount),
      description || 'Branch Withdrawal',
      req.employeeId
    );
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getQueue = async (req, res) => {
  try {
    const employee = await model.getEmployeeById(req.employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    const { status } = req.query;
    const allowedStatus = new Set(['waiting', 'served', 'cancelled', 'all']);
    const normalizedStatus = status && allowedStatus.has(status) ? status : 'waiting';
    if (!employee.branch_id) {
      const data = await model.getAllTokens(normalizedStatus);
      return res.json({
        success: true,
        data,
        scope: 'all_branches',
        message: 'Employee branch is not assigned. Showing queue for all branches.',
      });
    }
    const data = await model.getBranchTokens(employee.branch_id, normalizedStatus);
    res.json({ success: true, data, scope: 'employee_branch' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const serveToken = async (req, res) => {
  try {
    const employee = await model.getEmployeeById(req.employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    const token = employee.branch_id
      ? await model.getTokenByIdForBranch(req.params.id, employee.branch_id)
      : await model.getTokenById(req.params.id);
    if (!token) return res.status(404).json({ success: false, message: 'Token not found for your scope' });
    if (token.status !== 'waiting') {
      return res.status(400).json({ success: false, message: `Only waiting tokens can be served. Current status: ${token.status}` });
    }
    const updated = await model.updateTokenStatus(req.params.id, 'served');
    if (!updated) return res.status(404).json({ success: false, message: 'Token not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const cancelToken = async (req, res) => {
  try {
    const employee = await model.getEmployeeById(req.employeeId);
    if (!employee) return res.status(404).json({ success: false, message: 'Employee not found' });
    const token = employee.branch_id
      ? await model.getTokenByIdForBranch(req.params.id, employee.branch_id)
      : await model.getTokenById(req.params.id);
    if (!token) return res.status(404).json({ success: false, message: 'Token not found for your scope' });
    if (token.status !== 'waiting') {
      return res.status(400).json({ success: false, message: `Only waiting tokens can be cancelled. Current status: ${token.status}` });
    }
    const updated = await model.updateTokenStatus(req.params.id, 'cancelled');
    if (!updated) return res.status(404).json({ success: false, message: 'Token not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getServiceRequests = async (req, res) => {
  try {
    const employee = await model.getEmployeeById(req.employeeId);
    const { status, assigned } = req.query;
    const filters = {};
    if (employee?.branch_id) filters.branch_id = employee.branch_id;
    if (status) filters.status = status;
    if (assigned === 'me') filters.assigned_to = req.employeeId;
    const data = await model.getServiceRequests(filters);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const assignServiceRequest = async (req, res) => {
  try {
    const data = await model.assignServiceRequest(req.params.id, req.employeeId);
    if (!data) return res.status(404).json({ success: false, message: 'Service request not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resolveServiceRequest = async (req, res) => {
  try {
    const { notes } = req.body || {};
    const data = await model.resolveServiceRequest(req.params.id, notes || '');
    if (!data) return res.status(404).json({ success: false, message: 'Service request not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const employee = await model.getEmployeeById(req.employeeId);
    const filters = employee?.branch_id ? { branch_id: employee.branch_id } : {};
    const data = await model.getFeedback(filters);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDisputes = async (req, res) => {
  try {
    const { status } = req.query;
    const filters = status ? { status } : {};
    const data = await model.getDisputes(filters);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDisputeById = async (req, res) => {
  try {
    const data = await model.getDisputeById(req.params.id);
    if (!data) return res.status(404).json({ success: false, message: 'Dispute not found' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const resolveDispute = async (req, res) => {
  try {
    const { status, resolution_notes } = req.body || {};
    if (!['resolved', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const data = await model.resolveDispute(
      req.params.id,
      status,
      req.employeeId,
      resolution_notes || ''
    );
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const { accountNumber, type, startDate, endDate, limit } = req.query;
    const filters = {};
    if (accountNumber) filters.accountNumber = accountNumber;
    if (type) filters.type = type;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (limit) filters.limit = parseInt(limit, 10) || 100;
    const data = await model.getTransactions(filters);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getBranches = async (req, res) => {
  try {
    const data = await model.getBranches();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
