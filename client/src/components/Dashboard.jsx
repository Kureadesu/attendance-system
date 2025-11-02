import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, TrendingUp, AlertTriangle, BookOpen, RefreshCw, Calendar, Award, Skull, Filter } from 'lucide-react';
import { studentAPI, subjectAPI, attendanceAPI } from '../api/clientAPI';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    students: [],
    summary: {},
    studentStats: {},
    subjectStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState('today');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, customStartDate, customEndDate]);

  const fetchDashboardData = async () => {
    try {
      setError('');
      setLoading(true);

      let range = dateRange;
      // If custom range is selected and dates are provided
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        range = `custom?start_date=${customStartDate}&end_date=${customEndDate}`;
      }

      const [studentsRes, summaryRes] = await Promise.all([
        studentAPI.getAll(),
        attendanceAPI.getSummary(range)
      ]);

      console.log('Dashboard summary data:', summaryRes.data);

      setDashboardData({
        students: studentsRes.data,
        summary: summaryRes.data,
        studentStats: summaryRes.data.studentStats || {},
        subjectStats: summaryRes.data.subjectStats || {}
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const { students, summary, studentStats, subjectStats } = dashboardData;

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
    presentToday: summary.present || 0,
    absentToday: summary.absent || 0,
    lateToday: summary.late || 0,
    totalRecords: summary.total || 0,
    absentRate: summary.absentRate || 0,
    lateRate: summary.lateRate || 0
  };

  // Get range label for display
  const getRangeLabel = () => {
    switch (dateRange) {
      case 'today': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'custom': return 'Custom Range';
      default: return 'Today';
    }
  };

  // Data for pie chart - Student Attendance Overview
  const studentAttendancePieData = [
    { name: 'Present', value: stats.presentToday, count: stats.presentToday },
    { name: 'Absent', value: stats.absentToday, count: stats.absentToday },
    { name: 'Late', value: stats.lateToday, count: stats.lateToday }
  ];

  // Sample trend data (you can replace this with actual historical data from your API)
  const attendanceTrendData = [
    { date: '11-01', present: 45, absent: 5, late: 2, rate: 85 },
    { date: '11-02', present: 48, absent: 3, late: 1, rate: 92 },
    { date: '11-03', present: 42, absent: 6, late: 4, rate: 81 },
    { date: '11-04', present: 47, absent: 4, late: 1, rate: 90 },
    { date: '11-05', present: 46, absent: 3, late: 3, rate: 88 },
    { date: '11-06', present: 44, absent: 5, late: 3, rate: 85 },
    { date: '11-07', present: stats.presentToday, absent: stats.absentToday, late: stats.lateToday, rate: stats.attendanceRate }
  ];

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-300 rounded shadow">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-gray-600">Records: {payload[0].payload.count}</p>
          <p className="text-gray-600">
            Percentage: {stats.totalRecords > 0 ? 
              ((payload[0].value / stats.totalRecords) * 100).toFixed(1) : 0}%
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
      {/* Header with Date & Time and Filters */}
      <div className="flex justify-between items-start">
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
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Viewing Data For:</h3>
            <span className="text-lg font-bold text-blue-600">{getRangeLabel()}</span>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="custom">Custom Range</option>
            </select>

            {dateRange === 'custom' && (
              <div className="flex gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Start Date"
                />
                <span className="flex items-center text-gray-500">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="End Date"
                />
              </div>
            )}
          </div>
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
          description="Registered students"
        />
        <StatCard
          icon={TrendingUp}
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          color="green"
          description={`${getRangeLabel()} rate`}
        />
        <StatCard
          icon={BookOpen}
          title="Present"
          value={stats.presentToday}
          color="green"
          description={`${getRangeLabel()} present`}
        />
        <StatCard
          icon={AlertTriangle}
          title="Absent"
          value={stats.absentToday}
          color="red"
          description={`${getRangeLabel()} absent`}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Attendance Distribution - {getRangeLabel()}
          </h3>
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

        {/* Attendance Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Attendance Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#8884d8" 
                name="Attendance Rate %"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Top Performers - {getRangeLabel()}
          </h3>
          <div className="space-y-3">
            {studentStats.highest_attendance?.slice(0, 5).map((student, index) => (
              <div key={student.student_number} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 text-green-600 rounded-full font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.student_name}</p>
                    <p className="text-sm text-gray-500">{student.section}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 text-lg">{student.attendance_rate}%</p>
                  <p className="text-xs text-gray-500">
                    {student.present}/{student.total_classes} classes
                  </p>
                </div>
              </div>
            )) || <p className="text-gray-500 text-center py-4">No student data available for this period</p>}
          </div>
        </div>

        {/* Most Absences */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Most Absences - {getRangeLabel()}
          </h3>
          <div className="space-y-3">
            {studentStats.highest_absent?.slice(0, 5).map((student, index) => (
              <div key={student.student_number} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-full font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.student_name}</p>
                    <p className="text-sm text-gray-500">{student.section}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600 text-lg">{student.absent_rate}%</p>
                  <p className="text-xs text-gray-500">
                    {student.absent}/{student.total_classes} absences
                  </p>
                </div>
              </div>
            )) || <p className="text-gray-500 text-center py-4">No absence data available for this period</p>}
          </div>
        </div>
      </div>

      {/* Subject Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Performing Subjects */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Best Performing Subjects - {getRangeLabel()}
          </h3>
          <div className="space-y-3">
            {subjectStats.highest_attendance?.slice(0, 5).map((subject, index) => (
              <div key={subject.subject_id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{subject.subject_name}</p>
                  <p className="text-sm text-gray-500">{subject.schedule}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600 text-lg">{subject.attendance_rate}%</p>
                  <p className="text-xs text-gray-500">
                    {subject.present} present / {subject.total_records} total
                  </p>
                </div>
              </div>
            )) || <p className="text-gray-500 text-center py-4">No subject data available for this period</p>}
          </div>
        </div>

        {/* Subjects Needing Attention */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Subjects Needing Attention - {getRangeLabel()}
          </h3>
          <div className="space-y-3">
            {subjectStats.lowest_attendance?.slice(0, 5).map((subject, index) => (
              <div key={subject.subject_id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{subject.subject_name}</p>
                  <p className="text-sm text-gray-500">{subject.schedule}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600 text-lg">{subject.attendance_rate}%</p>
                  <p className="text-xs text-gray-500">
                    {subject.absent} absent / {subject.total_records} total
                  </p>
                </div>
              </div>
            )) || <p className="text-gray-500 text-center py-4">No subject data available for this period</p>}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="font-semibold text-gray-900 mb-4">Quick Actions</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/mark-attendance"
            className="bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Mark Attendance
          </Link>
          <Link
            to="/class-list"
            className="bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            View Class List
          </Link>
          <button 
            onClick={fetchDashboardData}
            className="bg-gray-600 text-white text-center py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Refresh Data
          </button>
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