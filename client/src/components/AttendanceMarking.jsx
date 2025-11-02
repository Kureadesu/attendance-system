import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, XCircle, Clock, Download } from 'lucide-react';
import { attendanceAPI, studentAPI, subjectAPI } from '../api/clientAPI';
import { exportToPDF } from '../utils/exportUtils';

const AttendanceMarking = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSubject && selectedDate) {
      fetchExistingAttendance();
    }
  }, [selectedSubject, selectedDate]);

  const fetchData = async () => {
    try {
      const [studentsRes, subjectsRes] = await Promise.all([
        studentAPI.getAll(),
        subjectAPI.getAll()
      ]);

      // Debug: Check what subjects data looks like
      console.log('Subjects API response:', subjectsRes.data);

      // Sort students alphabetically by name
      const sortedStudents = studentsRes.data.sort((a, b) => 
        a.name.localeCompare(b.name)
      );
      
      setStudents(sortedStudents);
      setSubjects(subjectsRes.data);
      if (subjectsRes.data.length > 0) {
        setSelectedSubject(subjectsRes.data[0].id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchExistingAttendance = async () => {
    try {
      const response = await attendanceAPI.getSubjectRecords(selectedSubject, { date: selectedDate });
      const existingAttendance = {};
      response.data.forEach(record => {
        existingAttendance[record.student_number] = record.status;
      });
      setAttendance(existingAttendance);
    } catch (error) {
      console.error('Error fetching existing attendance:', error);
      setAttendance({});
    }
  };

  const handleStatusChange = (studentNumber, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentNumber]: status
    }));
  };

  const handleSave = async () => {
    if (!selectedSubject || !selectedDate) {
      alert('Please select both subject and date');
      return;
    }

    setSaving(true);
    try {
      const attendanceRecords = Object.entries(attendance).map(([studentNumber, status]) => ({
        student_number: studentNumber,
        status
      }));

      await attendanceAPI.mark({
        date: selectedDate,
        subject_id: selectedSubject,
        records: attendanceRecords
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    const selectedSubjectObj = subjects.find(sub => sub.id === selectedSubject);
    exportToPDF(students, attendance, selectedDate, selectedSubjectObj);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-300';
      case 'absent': return 'bg-red-100 text-red-800 border-red-300';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'absent': return <XCircle className="w-4 h-4" />;
      case 'late': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  const getAttendanceStats = () => {
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    const late = Object.values(attendance).filter(status => status === 'late').length;
    const totalMarked = present + absent + late;
    
    return { present, absent, late, totalMarked };
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
        <div className="flex items-center space-x-4">
          {saved && (
            <span className="text-green-600 flex items-center">
              <CheckCircle className="w-5 h-5 mr-1" />
              Attendance saved successfully!
            </span>
          )}
          <button
            onClick={handleExportPDF}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Filters and Stats */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.name} - {subject.schedule}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Students
            </label>
            <p className="text-lg font-semibold text-gray-900">{students.length}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marked Today
            </label>
            <p className="text-lg font-semibold text-gray-900">
              {stats.totalMarked} / {students.length}
            </p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.present}</div>
            <div className="text-sm text-gray-600">Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <div className="text-sm text-gray-600">Absent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
            <div className="text-sm text-gray-600">Late</div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                No.
              </th>
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
            {students.map((student, index) => (
              <tr key={student.student_number} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {index + 1}
                </td>
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
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(attendance[student.student_number])}`}>
                    {getStatusIcon(attendance[student.student_number])}
                    <span className="ml-1 capitalize">
                      {attendance[student.student_number] || 'Not Marked'}
                    </span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleStatusChange(student.student_number, 'present')}
                      className={`px-2 py-1 rounded text-xs ${
                        attendance[student.student_number] === 'present'
                          ? 'bg-green-600 text-white'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.student_number, 'absent')}
                      className={`px-2 py-1 rounded text-xs ${
                        attendance[student.student_number] === 'absent'
                          ? 'bg-red-600 text-white'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      Absent
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.student_number, 'late')}
                      className={`px-2 py-1 rounded text-xs ${
                        attendance[student.student_number] === 'late'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                      }`}
                    >
                      Late
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceMarking;