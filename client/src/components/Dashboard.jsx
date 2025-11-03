import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, TrendingUp, AlertTriangle, BookOpen, RefreshCw, Calendar, Award, Skull, Clock, Filter } from 'lucide-react';
import { studentAPI, subjectAPI, attendanceAPI } from '../api/clientAPI';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

// Helper function to merge student names into stats data
const mergeStudentNames = (statsArray, studentsArray) => {
  return statsArray.map(stat => {
    const student = studentsArray.find(s => s.student_number === stat.student_number);
    return {
      ...stat,
      student_name: student ? student.name : 'Unknown Student',
      section: student ? student.section : 'Unknown Section'
    };
  });
};

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
  const [studentView, setStudentView] = useState('attendance'); // 'attendance', 'absent', 'late'
  const [attendanceTrendData, setAttendanceTrendData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange, customStartDate, customEndDate]);

  useEffect(() => {
    fetchTrendData();
  }, []);

  const fetchTrendData = async () => {
    try {
      const trendRes = await attendanceAPI.getTrend();
      setAttendanceTrendData(trendRes.data);
    } catch (error) {
      console.error('Error fetching trend data:', error);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setError('');
      setLoading(true);

      let range = dateRange;
      if (dateRange === 'custom' && customStartDate && customEndDate) {
        range = `custom?start_date=${customStartDate}&end_date=${customEndDate}`;
      }

      const [studentsRes, summaryRes] = await Promise.all([
        studentAPI.getAll(),
        attendanceAPI.getSummary(range)
      ]);

      // Merge student names into studentStats
      const mergedStudentStats = {
        highest_attendance: mergeStudentNames(summaryRes.data.studentStats?.highest_attendance || [], studentsRes.data),
        lowest_attendance: mergeStudentNames(summaryRes.data.studentStats?.lowest_attendance || [], studentsRes.data),
        highest_absent: mergeStudentNames(summaryRes.data.studentStats?.highest_absent || [], studentsRes.data),
        highest_late: mergeStudentNames(summaryRes.data.studentStats?.highest_late || [], studentsRes.data),
        all_students: mergeStudentNames(summaryRes.data.studentStats?.all_students || [], studentsRes.data)
      };

      setDashboardData({
        students: studentsRes.data,
        summary: summaryRes.data,
        studentStats: mergedStudentStats,
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

  // Get student data based on current view
  const getStudentData = () => {
    switch (studentView) {
      case 'attendance':
        return {
          title: 'Top Attendance',
          icon: Award,
          color: 'green',
          data: studentStats.highest_attendance || [],
          valueKey: 'attendance_rate',
          valueSuffix: '%',
          description: (student) => `${student.present}/${student.total_classes} classes`
        };
      case 'absent':
        return {
          title: 'Top Absentees',
          icon: Skull,
          color: 'red',
          data: studentStats.highest_absent || [],
          valueKey: 'absent_rate',
          valueSuffix: '%',
          description: (student) => `${student.absent} absences`
        };
      case 'late':
        return {
          title: 'Top Late Students',
          icon: Clock,
          color: 'yellow',
          data: studentStats.highest_late || [],
          valueKey: 'late_rate',
          valueSuffix: '%',
          description: (student) => `${student.late} late arrivals`
        };
      default:
        return {
          title: 'Top Attendance',
          icon: Award,
          color: 'green',
          data: studentStats.highest_attendance || [],
          valueKey: 'attendance_rate',
          valueSuffix: '%',
          description: (student) => `${student.present}/${student.total_classes} classes`
        };
    }
  };

  // Helper function to format schedules
  const formatSchedules = (schedules) => {
    if (!schedules || schedules.length === 0) return 'No schedule';
    return schedules
      .sort((a, b) => {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days.indexOf(a.day_of_week) - days.indexOf(b.day_of_week);
      })
      .map(schedule => `${schedule.day_of_week.slice(0, 3)} ${schedule.start_time.slice(0, 5)}-${schedule.end_time.slice(0, 5)}`)
      .join(', ');
  };

  // Fix subjects needing attention - sort by absent rate (descending) - highest absentees first
  const getSubjectsNeedingAttention = () => {
    const allSubjects = subjectStats.all_subjects || [];
    return allSubjects
      .sort((a, b) => b.absent_rate - a.absent_rate)
      .slice(0, 5);
  };

  const studentViewData = getStudentData();
  const subjectsNeedingAttention = getSubjectsNeedingAttention();

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

      {/* Consolidated Student Performance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Attendance Metrics - {getRangeLabel()}
          </h3>
          <div className="flex gap-2 mt-2 lg:mt-0">
            <button
              onClick={() => setStudentView('attendance')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                studentView === 'attendance'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Award className="w-4 h-4" />
              Top Attendance
            </button>
            <button
              onClick={() => setStudentView('absent')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                studentView === 'absent'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Skull className="w-4 h-4" />
              Top Absentees
            </button>
            <button
              onClick={() => setStudentView('late')}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                studentView === 'late'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              Top Late
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studentViewData.data.slice(0, 6).map((student, index) => (
            <div 
              key={student.student_number} 
              className={`p-4 rounded-lg border-l-4 ${
                studentView === 'attendance' ? 'border-green-500 bg-green-50' :
                studentView === 'absent' ? 'border-red-500 bg-red-50' :
                'border-yellow-500 bg-yellow-50'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                    studentView === 'attendance' ? 'bg-green-100 text-green-600' :
                    studentView === 'absent' ? 'bg-red-100 text-red-600' :
                    'bg-yellow-100 text-yellow-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.student_name}</p>
                    <p className="text-sm text-gray-500">{student.section}</p>
                  </div>
                </div>
                <span className={`text-lg font-bold ${
                  studentView === 'attendance' ? 'text-green-600' :
                  studentView === 'absent' ? 'text-red-600' :
                  'text-yellow-600'
                }`}>
                  {student[studentViewData.valueKey]}{studentViewData.valueSuffix}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {studentViewData.description(student)}
              </p>
              {studentView === 'attendance' && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${student.attendance_rate}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {studentViewData.data.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No {studentView} data available for this period
          </p>
        )}
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
                  <p className="text-sm text-gray-500">{formatSchedules(subject.schedules)}</p>
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

        {/* Subjects Needing Attention - FIXED: Now shows highest absent rate */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">
            Subjects Needing Attention - {getRangeLabel()}
          </h3>
          <div className="space-y-3">
            {subjectsNeedingAttention.map((subject, index) => (
              <div key={subject.subject_id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{subject.subject_name}</p>
                  <p className="text-sm text-gray-500">{formatSchedules(subject.schedules)}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600 text-lg">{subject.absent_rate}%</p>
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