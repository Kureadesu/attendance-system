// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StudentProfile from './components/StudentProfile';
import AttendanceMarking from './components/AttendanceMarking';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import './index.css';
import ClassList from './components/ClassList';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/mark-attendance" element={
              <ProtectedRoute>
                <Layout>
                  <AttendanceMarking />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/student/:studentNumber" element={
              <ProtectedRoute>
                <Layout>
                  <StudentProfile />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;