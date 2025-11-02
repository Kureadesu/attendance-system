// frontend/src/components/StudentProfile.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Calendar, User, Book } from 'lucide-react';
import axios from 'axios';
import { exportStudentPDF } from '../utils/pdfExport';

const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

const StudentProfile = () => {
  const { studentNumber } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    fetchStudentData();
  }, [studentNumber, timeRange]);

  const fetchStudentData = async () => {
    try {
      const response = await axios.get(`/api/students/${studentNumber}/attendance?range=${timeRange}`);
      setStudentData(response.data);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (studentData) {
      exportStudentPDF(studentData);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading student data...</div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Student not found</div>
      </div>
    );
  }

  const { statistics, attendance } = studentData;
  const student = attendance[0]?.Student || {};

  const pieData = [
    { name: 'Present', value: statistics.present },
    { name: 'Absent', value: statistics.absent },
    { name: 'Late', value: statistics.late }
  ];

  const subjectAnalysis = attendance.reduce((acc, record) => {
    const subjectName = record.Subject?.name;
    if (!acc[subjectName]) {
      acc[subjectName] = { present: 0, absent: 0, late: 0 };
    }
    acc[subjectName][record.status]++;
    return acc;
  }, {});

  const chartData = Object.entries(subjectAnalysis).map(([subject, data]) => ({
    subject,
    ...data
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
          <div className="flex items-center space-x-4 mt-2 text-gray-600">
            <div className="flex items-center">
              <User className="w-4 h-4 mr-2" />
              <span className="font-mono">{studentNumber}</span>
            </div>
            <div className="flex items-center">
              <Book className="w-4 h-4 mr-2" />
              <span>{student.section}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              <span>{student.year_level}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleExportPDF}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Export PDF
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${statistics.attendanceRate}%`}
          color="green"
        />
        <StatCard
          title="Absence Rate"
          value={`${statistics.absenceRate}%`}
          color="red"
        />
        <StatCard
          title="Late Rate"
          value={`${statistics.lateRate}%`}
          color="yellow"
        />
        <StatCard
          title="Total Records"
          value={statistics.total}
          color="blue"
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

        {/* Subject-wise Performance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Subject-wise Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" fill="#10b981" name="Present" />
              <Bar dataKey="absent" fill="#ef4444" name="Absent" />
              <Bar dataKey="late" fill="#f59e0b" name="Late" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Attendance History</h3>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendance.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {record.Subject?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.Subject?.schedule}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.Subject?.room}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      record.status === 'present' 
                        ? 'bg-green-100 text-green-800'
                        : record.status === 'absent'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {record.remarks || '-'}
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

const StatCard = ({ title, value, color }) => {
  const colorClasses = {
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    blue: 'bg-blue-50 border-blue-200'
  };

  const textColors = {
    green: 'text-green-700',
    red: 'text-red-700',
    yellow: 'text-yellow-700',
    blue: 'text-blue-700'
  };

  return (
    <div className={`p-4 rounded-lg border ${colorClasses[color]}`}>
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <p className={`text-2xl font-bold ${textColors[color]}`}>{value}</p>
    </div>
  );
};

export default StudentProfile;