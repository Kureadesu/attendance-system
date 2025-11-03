// api/clientAPI.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Student API
export const studentAPI = {
  getAll: () => api.get('/students'),
  getById: (id) => api.get(`/students/${id}`),
  getByStudentNumber: (studentNumber) => api.get(`/students/${studentNumber}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
};

// Subject API
export const subjectAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
};

// Schedule API
export const scheduleAPI = {
  getCurrent: () => api.get('/schedules/current'),
  getWeekly: () => api.get('/schedules/weekly'),
  getByDay: (day) => api.get(`/schedules/day/${day}`),
};

// Attendance API
export const attendanceAPI = {
  mark: (data) => api.post('/attendance/mark', data),
  getSummary: (range = 'today') => api.get(`/attendance/summary?range=${range}`),
  getClass: (params) => api.get('/attendance/class', { params }),
  getTrend: () => api.get('/attendance/trend'),
};

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },
};

// Class List API
export const classListAPI = {
  getAll: (params) => api.get('/classList', { params }),
  getStudent: (studentNumber, params) => api.get(`/classList/student/${studentNumber}`, { params }),
  getSections: () => api.get('/classList/sections'),
};

export default api;