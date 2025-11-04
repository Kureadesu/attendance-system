// client/src/components/LogViewer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { logAPI } from '../api/clientAPI';
import { Filter, RefreshCw } from 'lucide-react';

const LogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    startDate: '',
    endDate: '',
    limit: 50
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await logAPI.getLogs(filters);
      setLogs(response.data?.logs || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await logAPI.getStats({ period: 7 });
      setStats(response.data?.stats || {});
      setRecentActivity(response.data?.recentActivity || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [setStats, setRecentActivity]);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters, fetchLogs, fetchStats]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'create': return 'bg-green-900 text-green-300 border-green-700';
      case 'update': return 'bg-blue-900 text-blue-300 border-blue-700';
      case 'delete': return 'bg-red-900 text-red-300 border-red-700';
      case 'exempt': return 'bg-yellow-900 text-yellow-300 border-yellow-700';
      default: return 'bg-gray-900 text-gray-300 border-gray-700';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatAction = (action) => {
    switch (action) {
      case 'create': return 'Created';
      case 'update': return 'Updated';
      case 'delete': return 'Deleted';
      case 'exempt': return 'Exempted';
      default: return action;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
        <button
          onClick={() => {
            fetchLogs();
            fetchStats();
          }}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <div className="flex items-center mb-4">
          <Filter className="w-5 h-5 text-gray-300 mr-2" />
          <h3 className="text-lg font-medium text-white">Filters</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) => handleFilterChange('action', e.target.value)}
              className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All Actions</option>
              <option value="create">Created</option>
              <option value="update">Updated</option>
              <option value="delete">Deleted</option>
              <option value="exempt">Exempted</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Limit
            </label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="w-full border border-gray-600 rounded-md px-3 py-2 bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({
                action: '',
                startDate: '',
                endDate: '',
                limit: 50
              })}
              className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(activity.action)}`}>
                  {formatAction(activity.action)}
                </span>
                <div>
                  <p className="text-sm text-white">
                    {activity.admin?.full_name || activity.admin?.username} {formatAction(activity.action).toLowerCase()}
                    {activity.student ? ` attendance for ${activity.student.name}` : ''}
                    {activity.subject ? ` ${activity.subject.code}` : ''}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDateTime(activity.logged_at)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-600">
          <h3 className="text-lg font-medium text-white">Detailed Logs</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-600">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {log.admin?.full_name || log.admin?.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {log.subject ? `${log.subject.code} - ${log.subject.name}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {log.student ? `${log.student.name} (${log.student.student_number})` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {log.date || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDateTime(log.logged_at)}
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

export default LogViewer;
