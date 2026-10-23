import axios from 'axios';

const API_BASE = '/api/auth';

export const authApi = {
  signup: (formData) =>
    axios.post(`${API_BASE}/signup`, formData, { timeout: 60000 }).then((r) => r.data),

  login: (email, password) =>
    axios.post(`${API_BASE}/login`, { email, password }, { timeout: 15000 }).then((r) => r.data),

  sendOtp: (email) =>
    axios.post(`${API_BASE}/send-otp`, { email }, { timeout: 15000 }).then((r) => r.data),

  loginWithOtp: (email, otp) =>
    axios.post(`${API_BASE}/login-otp`, { email, otp }, { timeout: 15000 }).then((r) => r.data),

  getBranches: () =>
    axios.get(`${API_BASE}/branches`).then((r) => r.data),
};
