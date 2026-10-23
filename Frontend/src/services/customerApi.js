import axios from 'axios';

const API_BASE = '/api/customer';

const getHeaders = () => {
  const customerId = localStorage.getItem('customerId');
  return {
    'Content-Type': 'application/json',
    ...(customerId && { 'X-Customer-Id': customerId }),
  };
};

export const customerApi = {
  getProfile: () =>
    axios.get(`${API_BASE}/profile`, { headers: getHeaders() }).then((r) => r.data),

  getBalance: () =>
    axios.get(`${API_BASE}/balance`, { headers: getHeaders() }).then((r) => r.data),

  deposit: (amount, description) =>
    axios.post(`${API_BASE}/deposit`, { amount, description }, { headers: getHeaders() }).then((r) => r.data),

  withdraw: (amount, description) =>
    axios.post(`${API_BASE}/withdraw`, { amount, description }, { headers: getHeaders() }).then((r) => r.data),

  transfer: (receiverAccount, amount, description) =>
    axios.post(`${API_BASE}/transfer`, { receiverAccount, amount, description }, { headers: getHeaders() }).then((r) => r.data),

  getTransactions: (params) =>
    axios.get(`${API_BASE}/transactions`, { headers: getHeaders(), params }).then((r) => r.data),

  getTransactionById: (id) =>
    axios.get(`${API_BASE}/transactions/${id}`, { headers: getHeaders() }).then((r) => r.data),

  downloadStatement: (startDate, endDate) =>
    axios.get(`${API_BASE}/statement/download`, {
      headers: getHeaders(),
      params: { startDate, endDate },
    }).then((r) => {
      const blob = new Blob([JSON.stringify(r.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `statement-${startDate || 'start'}-${endDate || 'end'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }),

  getAlerts: () =>
    axios.get(`${API_BASE}/alerts`, { headers: getHeaders() }).then((r) => r.data),

  getExpensesSummary: (startDate, endDate) =>
    axios.get(`${API_BASE}/expenses/summary`, {
      headers: getHeaders(),
      params: { startDate, endDate },
    }).then((r) => r.data),

  getExpenseInsights: (startDate, endDate) =>
    axios.get(`${API_BASE}/expenses/insights`, {
      headers: getHeaders(),
      params: { startDate, endDate },
    }).then((r) => r.data),

  generateToken: (branchId) =>
    axios.post(`${API_BASE}/generate-token`, { branchId }, { headers: getHeaders() }).then((r) => r.data),

  getTokenStatus: () =>
    axios.get(`${API_BASE}/token-status`, { headers: getHeaders() }).then((r) => r.data),

  submitServiceRequest: (type, subject, description, branchId) =>
    axios.post(`${API_BASE}/service-request`, { type, subject, description, branchId }, { headers: getHeaders() }).then((r) => r.data),

  submitFeedback: (rating, message, branchId) =>
    axios.post(`${API_BASE}/feedback`, { rating, message, branchId }, { headers: getHeaders() }).then((r) => r.data),

  submitDispute: (transactionId, reason) =>
    axios.post(`${API_BASE}/dispute`, { transactionId, reason }, { headers: getHeaders() }).then((r) => r.data),

  getPendingApprovals: () =>
    axios.get(`${API_BASE}/pending-approvals`, { headers: getHeaders() }).then((r) => r.data),

  getBranches: () =>
    axios.get(`${API_BASE}/branches`).then((r) => r.data),
};
