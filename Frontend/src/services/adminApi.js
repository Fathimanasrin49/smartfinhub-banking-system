import axios from 'axios';

const API_BASE = '/api/admin';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Admin-Id': localStorage.getItem('adminId'),
});

export const adminApi = {
  getDashboard: () => axios.get(`${API_BASE}/dashboard`, { headers: getHeaders() }).then((r) => r.data),
  getEmployees: () => axios.get(`${API_BASE}/employees`, { headers: getHeaders() }).then((r) => r.data),
  updateEmployee: (id, data) => axios.put(`${API_BASE}/employees/${id}`, data, { headers: getHeaders() }).then((r) => r.data),
  getCustomers: () => axios.get(`${API_BASE}/customers`, { headers: getHeaders() }).then((r) => r.data),
  updateCustomer: (id, data) => axios.put(`${API_BASE}/customers/${id}`, data, { headers: getHeaders() }).then((r) => r.data),
  getSuspicious: () => axios.get(`${API_BASE}/suspicious`, { headers: getHeaders() }).then((r) => r.data),
  getAnalyticsTransactions: (days = 7) => axios.get(`${API_BASE}/analytics/transactions`, { headers: getHeaders(), params: { days } }).then((r) => r.data),
  getAnalyticsExpenses: () => axios.get(`${API_BASE}/analytics/expenses`, { headers: getHeaders() }).then((r) => r.data),
  getAnalyticsRisks: () => axios.get(`${API_BASE}/analytics/risks`, { headers: getHeaders() }).then((r) => r.data),
  getLogs: (limit = 100) => axios.get(`${API_BASE}/logs`, { headers: getHeaders(), params: { limit } }).then((r) => r.data),
  getSettings: () => axios.get(`${API_BASE}/settings`, { headers: getHeaders() }).then((r) => r.data),
  updateSettings: (settings) => axios.put(`${API_BASE}/settings`, settings, { headers: getHeaders() }).then((r) => r.data),
  triggerBackup: () => axios.post(`${API_BASE}/backup`, {}, { headers: getHeaders() }).then((r) => r.data),
  getBranches: () => axios.get(`${API_BASE}/branches`, { headers: getHeaders() }).then((r) => r.data),
};
