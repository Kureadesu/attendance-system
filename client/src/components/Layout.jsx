// frontend/src/components/Layout.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { LogOut, Users, Calendar, Home, Shield, FileText } from 'lucide-react';

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Mark Attendance', href: '/mark-attendance', icon: Calendar },
    { name: 'Exemptions', href: '/exemptions', icon: Shield },
    { name: 'Logs', href: '/logs', icon: FileText },
    { name: 'Students', href: '/class-list', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-primary">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-xl font-bold text-white">Attendance System</h1>
            <p className="text-sm text-gray-300">Class Management</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-accent text-white border-r-2 border-accent'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="flex items-center w-full px-4 py-3 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
