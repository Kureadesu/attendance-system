import React, { useState, useEffect } from 'react';
import { Plus, Trash2, AlertCircle, CheckCircle, X } from 'lucide-react';
import { exemptionAPI, subjectAPI } from '../api/clientAPI';

const ExemptionManagement = () => {
  const [exemptions, setExemptions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: '',
    scheduleId: '',
    date: '',
    reason: ''
  });
  const [availableSchedules, setAvailableSchedules] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    setLoading(true);
    const [exemptionsRes, subjectsRes] = await Promise.all([
      exemptionAPI.getAll(),
      subjectAPI.getAll()
    ]);

    setExemptions(exemptionsRes.data || []);
    setSubjects(subjectsRes.data || []);
  } catch (error) {
    console.error('Error fetching data:', error);
    
    // More specific error message
    if (error.response?.status === 500) {
      setError('Server error: Unable to load exemptions. Please check database connections.');
    } else {
      setError('Failed to load exemptions');
    }
    
    // Set empty arrays as fallback
    setExemptions([]);
    setSubjects([]);
  } finally {
    setLoading(false);
  }
};

  const handleSubjectChange = (subjectId) => {
    const subject = subjects.find(s => s.id === parseInt(subjectId));
    setFormData(prev => ({
      ...prev,
      subjectId,
      scheduleId: ''
    }));

    if (subject) {
      setAvailableSchedules(subject.schedules || []);
    } else {
      setAvailableSchedules([]);
    }
  };

  const handleCreateExemption = async (e) => {
  e.preventDefault();
  setError('');
  setSuccess('');

  try {
    // Prepare the data properly
    const submissionData = {
      subjectId: parseInt(formData.subjectId),
      scheduleId: formData.scheduleId ? parseInt(formData.scheduleId) : null,
      date: formData.date,
      reason: formData.reason
    };

    console.log('Submitting exemption:', submissionData);

    await exemptionAPI.create(submissionData);
    setSuccess('Exemption created successfully. Note: Only one exemption per subject per date is allowed.');
    setFormData({
      subjectId: '',
      scheduleId: '',
      date: '',
      reason: ''
    });
    setShowCreateForm(false);
    fetchData();
  } catch (error) {
    console.error('Error creating exemption:', error);
    
    // Better error message handling
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.details || 
                        'Failed to create exemption';
    
    setError(errorMessage);
  }
};

  const handleDeleteExemption = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exemption?')) {
      return;
    }

    try {
      await exemptionAPI.delete(id);
      setSuccess('Exemption deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting exemption:', error);
      setError(error.response?.data?.error || 'Failed to delete exemption');
    }
  };

  const formatScheduleTime = (schedule) => {
    if (!schedule) return 'All schedules';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-300">Loading exemptions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Exemption Management</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Exemption
        </button>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
          <button
            onClick={() => setError('')}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-900 border border-green-700 text-green-300 px-4 py-3 rounded-lg flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
          <button
            onClick={() => setSuccess('')}
            className="ml-auto text-green-400 hover:text-green-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Exemption Form */}
      {showCreateForm && (
        <div className="bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Exemption</h3>
          <form onSubmit={handleCreateExemption} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject *
                </label>
                <select
                  value={formData.subjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  required
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
                  Schedule (Optional)
                </label>
                <select
                  value={formData.scheduleId}
                  onChange={(e) => setFormData(prev => ({ ...prev, scheduleId: e.target.value }))}
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  disabled={!formData.subjectId}
                >
                  <option value="">All schedules (subject-wide exemption)</option>
                  {availableSchedules.map(schedule => (
                    <option key={schedule.id} value={schedule.id}>
                      {formatScheduleTime(schedule)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Reason *
                </label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="e.g., Instructor announced no class"
                  className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Create Exemption
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Exemptions List */}
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-600">
          <h3 className="text-lg font-semibold text-white">Current Exemptions</h3>
        </div>

        {exemptions.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            No exemptions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Reason
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-600">
                {exemptions.map((exemption) => (
                  <tr key={exemption.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(exemption.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {exemption.subject?.code} - {exemption.subject?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {exemption.schedule ? formatScheduleTime(exemption.schedule) : 'All schedules'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">
                      {exemption.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {exemption.admin?.full_name || exemption.admin?.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <button
                        onClick={() => handleDeleteExemption(exemption.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Delete exemption"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExemptionManagement;
