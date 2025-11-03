import React, { useState, useEffect, useCallback } from 'react';
import { Save, CheckCircle, XCircle, Clock, Download, AlertCircle, Info, Shield } from 'lucide-react';
import { attendanceAPI, studentAPI, subjectAPI, exemptionAPI } from '../api/clientAPI';
import { exportToPDF } from '../utils/exportUtils';

const AttendanceMarking = () => {
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [attendance, setAttendance] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [scheduleWarning, setScheduleWarning] = useState('');
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [isExempted, setIsExempted] = useState(false);
  const [exemptionInfo, setExemptionInfo] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const checkExemption = useCallback(async () => {
    if (!selectedSubject || !selectedDate) return;

    try {
      const response = await exemptionAPI.check({
        subjectId: selectedSubject,
        scheduleId: selectedSchedule || undefined,
        date: selectedDate
      });

      setIsExempted(response.data.isExempted);
      setExemptionInfo(response.data.exemption);
    } catch (error) {
      console.error('Error checking exemption:', error);
      setIsExempted(false);
      setExemptionInfo(null);
    }
  }, [selectedSubject, selectedSchedule, selectedDate]);

  const validateSchedule = useCallback(() => {
    const subject = subjects.find(s => s.id === parseInt(selectedSubject));
    if (!subject) return;

    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

    // Filter schedules that match the selected day
    const matchingSchedules = subject.schedules?.filter(
      schedule => schedule.day_of_week === dayOfWeek
    ) || [];

    setAvailableSchedules(matchingSchedules);

    if (matchingSchedules.length === 0) {
      setScheduleWarning(`⚠️ No class scheduled for ${subject.name} on ${dayOfWeek}`);
      setSelectedSchedule('');
    } else {
      setScheduleWarning('');
      // Auto-select first schedule if only one available
      if (matchingSchedules.length === 1) {
        setSelectedSchedule(matchingSchedules[0].id.toString());
      }
    }
  }, [subjects, selectedSubject, selectedDate]);

  const fetchExistingAttendance = useCallback(async () => {
    try {
      const response = await attendanceAPI.getClass({
        date: selectedDate,
        subjectId: selectedSubject
      });
      const existingAttendance = {};
      response.data.forEach(record => {
        existingAttendance[record.student_number] = record.status;
      });
      setAttendance(existingAttendance);
    } catch (error) {
      console.error('Error fetching existing attendance:', error);
      setAttendance({});
    }
  }, [selectedDate, selectedSubject]);

  useEffect(() => {
    if (selectedSubject && selectedDate) {
      validateSchedule();
      checkExemption();
      fetchExistingAttendance();
    }
  }, [selectedSubject, selectedDate, validateSchedule, checkExemption, fetchExistingAttendance]);

  const fetchData = async () => {
    try {
      const [studentsRes, subjectsRes] = await Promise.all([
        studentAPI.getAll(),
        subjectAPI.getAll()
      ]);

      console.log('Subjects with schedules:', subjectsRes.data);

      const sortedStudents = studentsRes.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      const sortedSubjects = subjectsRes.data.sort((a, b) =>
        a.name.localeCompare(b.name)
      );

      setStudents(sortedStudents);
      setSubjects(sortedSubjects);
      if (sortedSubjects.length > 0) {
        setSelectedSubject(sortedSubjects[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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

    if (!selectedSchedule) {
      alert('Please select a schedule for this class');
      return;
    }

    if (isExempted) {
      const confirm = window.confirm(
        'This class is marked as exempted. Are you sure you want to mark attendance anyway?'
      );
      if (!confirm) return;
    }

    if (scheduleWarning) {
      const confirm = window.confirm(
        'Warning: No class is scheduled on this day. Do you want to continue anyway?'
      );
      if (!confirm) return;
    }

    setSaving(true);
    try {
      const attendanceRecords = Object.entries(attendance).map(([studentNumber, status]) => ({
        studentNumber,
        status
      }));

      await attendanceAPI.mark({
        date: selectedDate,
        subjectId: parseInt(selectedSubject),
        scheduleId: parseInt(selectedSchedule),
        attendanceRecords
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert(error.response?.data?.error || 'Error saving attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = () => {
    const selectedSubjectObj = subjects.find(sub => sub.id === parseInt(selectedSubject));
    exportToPDF(students, attendance, selectedDate, selectedSubjectObj, selectedSchedule);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-900 text-green-300 border-green-700';
      case 'absent': return 'bg-red-900 text-red-300 border-red-700';
      case 'late': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      default: return 'bg-gray-900 text-gray-300 border-gray-700';
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

    return { present, absent, late };
  };

  const stats = getAttendanceStats();

  const formatScheduleTime = (schedule) => {
    if (!schedule) return '';
    const startTime = new Date(`2000-01-01T${schedule.start_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    const endTime = new Date(`2000-01-01T${schedule.end_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    return `${schedule.day_of_week} | ${startTime} - ${endTime}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Mark Attendance</h1>
        <div className="flex items-center space-x-4">
          {saved && (
            <span className="text-green-400 flex items-center">
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
            disabled={saving || !selectedSchedule}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Attendance'}
          </button>
        </div>
      </div>

      {/* Exemption Warning */}
      {isExempted && (
        <div className="bg-blue-900 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <Shield className="h-5 w-5 text-blue-400 mr-2" />
            <div>
              <p className="text-sm text-blue-200 font-medium">Class Exempted</p>
              <p className="text-sm text-blue-200">
                Reason: {exemptionInfo?.reason}
                {exemptionInfo?.schedule ? ` (Schedule: ${formatScheduleTime(exemptionInfo.schedule)})` : ' (All schedules)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Warning */}
      {scheduleWarning && (
        <div className="bg-yellow-900 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <div>
              <p className="text-sm text-yellow-200">{scheduleWarning}</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Stats */}
      <div className="bg-gray-800 p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Subject
            </label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Schedule *
            </label>
            <select
              value={selectedSchedule}
              onChange={(e) => setSelectedSchedule(e.target.value)}
              className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
              disabled={availableSchedules.length === 0}
            >
              <option value="">
                {availableSchedules.length === 0 ? 'No schedule available' : 'Select Schedule'}
              </option>
              {availableSchedules.map(schedule => (
                <option key={schedule.id} value={schedule.id}>
                  {formatScheduleTime(schedule)}
                </option>
              ))}
            </select>
            {availableSchedules.length === 0 && selectedSubject && (
              <p className="text-xs text-red-400 mt-1">
                No class scheduled on this day
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Total Students
            </label>
            <p className="text-lg font-semibold text-white">{students.length}</p>
          </div>
        </div>

        {/* Info Box */}
        {selectedSchedule && (
          <div className="mt-4 bg-blue-900 border border-blue-700 rounded-lg p-3">
            <div className="flex items-start">
              <Info className="w-5 h-5 text-blue-400 mr-2 mt-0.5" />
              <div className="text-sm text-blue-200">
                <p className="font-medium">Selected Schedule:</p>
                <p>
                  {formatScheduleTime(availableSchedules.find(s => s.id === parseInt(selectedSchedule)))}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-600">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{stats.present}</div>
            <div className="text-sm text-gray-300">Present</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{stats.absent}</div>
            <div className="text-sm text-gray-300">Absent</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{stats.late}</div>
            <div className="text-sm text-gray-300">Late</div>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Student Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Section
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-600">
            {students.map((student, index) => (
              <tr key={student.student_number} className="hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-white">
                  {student.student_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
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
