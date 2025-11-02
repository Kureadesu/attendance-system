
// frontend/src/utils/clientAPI.js
import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000', // Use proxy or direct URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
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

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Auto logout if token is invalid
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Student API calls
export const studentAPI = {
  // Get all students
  getAll: () => apiClient.get('/api/students'),
  
  // Get student by student number
  getByNumber: (studentNumber) => 
    apiClient.get(`/api/students/${studentNumber}`),
  
  // Create new student
  create: (studentData) => 
    apiClient.post('/api/students', studentData),
  
  // Update student
  update: (studentNumber, studentData) => 
    apiClient.put(`/api/students/${studentNumber}`, studentData),
  
  // Delete student (soft delete)
  delete: (studentNumber) => 
    apiClient.delete(`/api/students/${studentNumber}`)
};

// Subject API calls
export const subjectAPI = {
  // Get all subjects
  getAll: () => apiClient.get('/api/subjects'),
  
  // Get subject by ID
  getById: (subjectId) => 
    apiClient.get(`/api/subjects/${subjectId}`),
  
  // Create new subject
  create: (subjectData) => 
    apiClient.post('/api/subjects', subjectData),
  
  // Update subject
  update: (subjectId, subjectData) => 
    apiClient.put(`/api/subjects/${subjectId}`, subjectData),
  
  // Delete subject
  delete: (subjectId) => 
    apiClient.delete(`/api/subjects/${subjectId}`)
};

// Attendance API calls
export const attendanceAPI = {
  // Get attendance summary
  getSummary: (range = 'month') =>
    apiClient.get(`/api/attendance/summary?range=${range}`),

  // Get attendance trend data
  getTrend: () =>
    apiClient.get('/api/attendance/trend'),

  // Mark attendance
  mark: (attendanceData) =>
    apiClient.post('/api/attendance/mark', attendanceData),

  // Get attendance records for a subject - FIXED THIS LINE
  getSubjectRecords: (subjectId, params = {}) =>
    apiClient.get(`/api/attendance/subject/${subjectId}`, { params }),

  // Get attendance records for a student
  getStudentRecords: (studentNumber, params = {}) =>
    apiClient.get(`/api/attendance/student/${studentNumber}`, { params })
};

// Auth API calls
export const authAPI = {
  // Login
  login: (credentials) => 
    apiClient.post('/api/auth/login', credentials),
  
  // Logout
  logout: () => apiClient.post('/api/auth/logout'),
  
  // Check auth status
  checkAuth: () => apiClient.get('/api/auth/me'),
  
  // Change password
  changePassword: (passwordData) => 
    apiClient.put('/api/auth/change-password', passwordData)
};

// Dashboard API calls
export const dashboardAPI = {
  // Get all dashboard data in one call
  getOverview: () => 
    apiClient.get('/api/dashboard/overview'),
  
  // Get quick stats
  getStats: () => 
    apiClient.get('/api/dashboard/stats')
};

// Export the base client for custom requests
export default apiClient;