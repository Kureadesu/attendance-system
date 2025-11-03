// client/src/api/clientAPI.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// Student API
export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  create: (student) => api.post('/students', student),
  update: (id, student) => api.put(`/students/${id}`, student),
  delete: (id) => api.delete(`/students/${id}`),
};

// Subject API
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (subject) => api.post('/subjects', subject),
  update: (id, subject) => api.put(`/subjects/${id}`, subject),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Attendance API
export const attendanceAPI = {
  mark: (data) => api.post('/attendance/mark', data),
  getSummary: (range) => api.get(`/attendance/summary?range=${range}`),
  getClass: (params) => api.get('/attendance/class', { params }),
  getTrend: () => api.get('/attendance/trend'),
};

// Exemption API
/*
export const exemptionAPI = {
  create: (data) => api.post('/exemptions', data),
  getAll: (params) => api.get('/exemptions', { params }),
  check: (params) => api.get('/exemptions/check', { params }),
  delete: (id) => api.delete(`/exemptions/${id}`),
};
*/
export const exemptionAPI = {
create: (data) => api.post('/exemptions', data, {
    headers: {
      'Content-Type': 'application/json',
    }
  }),
  getAll: (params) => api.get('/exemptions', { params }),
  check: (params) => api.get('/exemptions/check', { params }),
  delete: (id) => api.delete(`/exemptions/${id}`),
};
// Logs API
export const logAPI = {
  getLogs: (params) => api.get('/logs', { params }),
  getStats: (params) => api.get('/logs/stats', { params }),
};

export default api;
