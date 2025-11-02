// frontend/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import axios from 'axios';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [studentsRes, summaryRes] = await Promise.all([
        axios.get('/api/students'),
        axios.get('/api/attendance/summary?range=month')
      ]);

      setStudents(studentsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallStats = () => {
    if (!students.length) return null;

    const totalStudents = students.length;
    let totalAbsent = 0;
    let totalLate = 0;
    let totalPresent = 0;

    students.forEach(student => {
      student.attendanceStats?.forEach(stat => {
        const count = parseInt(stat.count);
        if (stat.status === 'absent') totalAbsent += count;
        if (stat.status === 'late') totalLate += count;
        if (stat.status === 'present') totalPresent += count;
      });
    });

    const totalRecords = totalAbsent + totalLate + totalPresent;
    const attendanceRate = totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : 0;

    return {
      totalStudents,
      attendanceRate,
      totalAbsent,
      totalLate,
      totalPresent
    };
  };

  const stats = calculateOverallStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const pieData = [
    { name: 'Present', value: stats?.totalPresent || 0 },
    { name: 'Absent', value: stats?.totalAbsent || 0 },
    { name: 'Late', value: stats?.totalLate || 0 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/mark-attendance"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Mark Attendance
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Students"
          value={stats?.totalStudents || 0}
          color="blue"
        />
        <StatCard
          icon={TrendingUp}
          title="Attendance Rate"
          value={`${stats?.attendanceRate || 0}%`}
          color="green"
        />
        <StatCard
          icon={Calendar}
          title="Absent Today"
          value={summary?.absentToday || 0}
          color="red"
        />
        <StatCard
          icon={AlertTriangle}
          title="Late Today"
          value={summary?.lateToday || 0}
          color="yellow"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Attendance Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Student Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Student Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={students.slice(0, 10).map(student => ({
              name: student.name.split(' ')[0],
              attendance: student.attendanceStats?.find(s => s.status === 'present')?.count || 0,
              absence: student.attendanceStats?.find(s => s.status === 'absent')?.count || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="attendance" fill="#10b981" name="Present" />
              <Bar dataKey="absence" fill="#ef4444" name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Students */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold">Recent Students</h3>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.slice(0, 5).map((student) => (
                <tr key={student.student_number}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">
                    {student.student_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.section}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      to={`/student/${student.student_number}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600'
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;