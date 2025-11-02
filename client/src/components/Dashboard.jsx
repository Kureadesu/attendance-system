import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, AlertTriangle, BookOpen, RefreshCw, Calendar } from 'lucide-react';
import { studentAPI, subjectAPI, attendanceAPI } from '../api/clientAPI';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    students: [],
    summary: {},
    monthlyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError('');
      setLoading(true);

      const [studentsRes, summaryRes, monthlyRes] = await Promise.all([
        studentAPI.getAll(),
        attendanceAPI.getSummary('today'),
        attendanceAPI.getSummary('month')
      ]);

      setDashboardData({
        students: studentsRes.data,
        summary: summaryRes.data,
        monthlyStats: monthlyRes.data.monthlyStats || []
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const { students, summary, monthlyStats } = dashboardData;

  // Get current date and time
  const currentDateTime = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Calculate stats from API data
  const stats = {
    totalStudents: students.length,
    attendanceRate: summary.attendanceRate || 0,
    presentToday: summary.presentToday || 0,
    absentToday: summary.absentToday || 0,
    lateToday: summary.lateToday || 0
  };

  // Data for pie chart - Student Attendance Overview
  const studentAttendancePieData = [
    { name: 'Present', value: stats.presentToday, count: stats.presentToday },
    { name: 'Absent', value: stats.absentToday, count: stats.absentToday },
    { name: 'Late', value: stats.lateToday, count: stats.lateToday }
  ];

  // Data for bar chart - Monthly Attendance Rate
  const monthlyAttendanceData = monthlyStats.map(month => ({
    name: month.month,
    attendanceRate: month.attendanceRate,
    present: month.present,
    absent: month.absent,
    late: month.late
  }));

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-gray-600">Students: {payload[0].payload.count}</p>
          <p className="text-gray-600">
            Percentage: {((payload[0].value / (stats.presentToday + stats.absentToday + stats.lateToday)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Date & Time */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 flex items-center mt-1">
            <Calendar className="w-4 h-4 mr-2" />
            {currentDateTime}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchDashboardData}
            className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link
            to="/mark-attendance"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mark Attendance
          </Link>
          <Link
            to="/class-list"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Class List
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Students"
          value={stats.totalStudents}
          color="blue"
          description="From database"
        />
        <StatCard
          icon={TrendingUp}
          title="Attendance Rate Today"
          value={`${stats.attendanceRate}%`}
          color="green"
          description="Based on today's records"
        />
        <StatCard
          icon={BookOpen}
          title="Present Today"
          value={stats.presentToday}
          color="green"
          description="Students present"
        />
        <StatCard
          icon={AlertTriangle}
          title="Absent Today"
          value={stats.absentToday}
          color="red"
          description="Students absent"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Attendance Overview - PIE CHART */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Student Attendance Overview (Today)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={studentAttendancePieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {studentAttendancePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Monthly Attendance Rate - BAR CHART */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Monthly Attendance Rate</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'attendanceRate' ? `${value}%` : value,
                  name === 'attendanceRate' ? 'Attendance Rate' : name
                ]}
              />
              <Legend />
              <Bar 
                dataKey="attendanceRate" 
                fill="#8884d8" 
                name="Attendance Rate" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-semibold text-gray-900 mb-3">Attendance Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Records Today:</span>
              <span className="font-semibold">{stats.presentToday + stats.absentToday + stats.lateToday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Present Rate:</span>
              <span className="font-semibold text-green-600">
                {((stats.presentToday / (stats.presentToday + stats.absentToday + stats.lateToday)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Absent Rate:</span>
              <span className="font-semibold text-red-600">
                {((stats.absentToday / (stats.presentToday + stats.absentToday + stats.lateToday)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-semibold text-gray-900 mb-3">Recent Activity</h4>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">Last attendance marked: Today</p>
            <p className="text-gray-600">System updated: Just now</p>
            <p className="text-gray-600">Total subjects: {summary.totalSubjects || 0}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h4 className="font-semibold text-gray-900 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <Link
              to="/mark-attendance"
              className="block w-full bg-blue-600 text-white text-center py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Mark Attendance
            </Link>
            <Link
              to="/class-list"
              className="block w-full bg-green-600 text-white text-center py-2 rounded hover:bg-green-700 transition-colors"
            >
              View Class List
            </Link>
            <button className="block w-full bg-gray-600 text-white text-center py-2 rounded hover:bg-gray-700 transition-colors">
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, color, description }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;