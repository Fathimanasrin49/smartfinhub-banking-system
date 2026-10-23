import axios from 'axios';

const API_BASE = '/api/employee';

const getHeaders = () => {
  const userId = localStorage.getItem('userId');
  return {
    'Content-Type': 'application/json',
    ...(userId && { 'X-Employee-Id': userId }),
  };
};

export const employeeApi = {
  getDashboard: () =>
    axios.get(`${API_BASE}/dashboard`, { headers: getHeaders() }).then((r) => r.data),

  getBranches: () =>
    axios.get(`${API_BASE}/branches`, { headers: getHeaders() }).then((r) => r.data),

  getCustomers: (params) =>
    axios.get(`${API_BASE}/customers`, { headers: getHeaders(), params }).then((r) => r.data),

  getCustomerById: (id) =>
    axios.get(`${API_BASE}/customers/${id}`, { headers: getHeaders() }).then((r) => r.data),

  createCustomer: (data) =>
    axios.post(`${API_BASE}/customers`, data, { headers: getHeaders() }).then((r) => r.data),

  updateCustomer: (id, data) =>
    axios.put(`${API_BASE}/customers/${id}`, data, { headers: getHeaders() }).then((r) => r.data),

  updateCustomerKyc: (id, kyc_status, reject_reason) =>
    axios.put(`${API_BASE}/customers/${id}/kyc`, { kyc_status, reject_reason }, { headers: getHeaders() }).then((r) => r.data),

  getCustomerTransactions: (id, params) =>
    axios.get(`${API_BASE}/customers/${id}/transactions`, { headers: getHeaders(), params }).then((r) => r.data),

  getApprovals: () =>
    axios.get(`${API_BASE}/approvals`, { headers: getHeaders() }).then((r) => r.data),

  approveRequest: (id) =>
    axios.post(`${API_BASE}/approvals/${id}/approve`, {}, { headers: getHeaders() }).then((r) => r.data),

  rejectRequest: (id, reason) =>
    axios.post(`${API_BASE}/approvals/${id}/reject`, { reason }, { headers: getHeaders() }).then((r) => r.data),

  branchDeposit: (customerId, amount, description) =>
    axios.post(`${API_BASE}/branch-deposit`, { customerId, amount, description }, { headers: getHeaders() }).then((r) => r.data),

  branchWithdraw: (customerId, amount, description) =>
    axios.post(`${API_BASE}/branch-withdraw`, { customerId, amount, description }, { headers: getHeaders() }).then((r) => r.data),

  getQueue: (status) =>
    axios.get(`${API_BASE}/queue`, { headers: getHeaders(), params: { status } }).then((r) => r.data),

  serveToken: (id) =>
    axios.post(`${API_BASE}/queue/${id}/serve`, {}, { headers: getHeaders() }).then((r) => r.data),

  cancelToken: (id) =>
    axios.post(`${API_BASE}/queue/${id}/cancel`, {}, { headers: getHeaders() }).then((r) => r.data),

  getServiceRequests: (params) =>
    axios.get(`${API_BASE}/service-requests`, { headers: getHeaders(), params }).then((r) => r.data),

  assignServiceRequest: (id) =>
    axios.post(`${API_BASE}/service-requests/${id}/assign`, {}, { headers: getHeaders() }).then((r) => r.data),

  resolveServiceRequest: (id, notes) =>
    axios.post(`${API_BASE}/service-requests/${id}/resolve`, { notes }, { headers: getHeaders() }).then((r) => r.data),

  getFeedback: () =>
    axios.get(`${API_BASE}/feedback`, { headers: getHeaders() }).then((r) => r.data),

  getDisputes: (status) =>
    axios.get(`${API_BASE}/disputes`, { headers: getHeaders(), params: { status } }).then((r) => r.data),

  getDisputeById: (id) =>
    axios.get(`${API_BASE}/disputes/${id}`, { headers: getHeaders() }).then((r) => r.data),

  resolveDispute: (id, status, resolution_notes) =>
    axios.post(`${API_BASE}/disputes/${id}/resolve`, { status, resolution_notes }, { headers: getHeaders() }).then((r) => r.data),

  getTransactions: (params) =>
    axios.get(`${API_BASE}/transactions`, { headers: getHeaders(), params }).then((r) => r.data),
};
