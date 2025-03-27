import React, { useState, useEffect } from 'react';
import axios from '../config/axios';

const TEXT = {
  HEADER: 'Admin Panel',
  REPORTS: 'Reports Management',
  STATUS: {
    PENDING: 'Pending',
    IN_PROGRESS: 'In Progress',
    RESOLVED: 'Resolved',
    REJECTED: 'Rejected'
  },
  MESSAGES: {
    STATUS_UPDATED: 'Report status updated successfully',
    REPORT_DELETED: 'Report deleted successfully',
    ERROR: 'An error occurred. Please try again.'
  },
  BUTTONS: {
    UPDATE: 'Update Status',
    DELETE: 'Delete Report',
    SAVE: 'Save Changes'
  }
};

const AdminPanel = () => {
  const [reports, setReports] = useState([]); // Always an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);
  const [status, setStatus] = useState('');
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  useEffect(() => {
    if (message) setTimeout(() => setMessage(''), 3000);
    if (error) setTimeout(() => setError(''), 3000);
  }, [message, error]);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports');
      setReports(response.data || []); // Fallback to empty array
    } catch (error) {
      console.error('Fetch reports error:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to load reports');
      setReports([]); // Ensure reports is an array even on failure
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.patch(`/api/reports/${selectedReport._id}/status`, { status, comment });
      setMessage(TEXT.MESSAGES.STATUS_UPDATED);
      fetchReports();
      setSelectedReport(null);
      setStatus('');
      setComment('');
    } catch (error) {
      console.error('Update status error:', error.response?.data || error.message);
      setError(error.response?.data?.message || TEXT.MESSAGES.ERROR);
    }
  };

  const handleDelete = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await axios.delete(`/api/reports/${reportId}`);
      setMessage(TEXT.MESSAGES.REPORT_DELETED);
      fetchReports();
    } catch (error) {
      console.error('Delete report error:', error.response?.data || error.message);
      setError(error.response?.data?.message || TEXT.MESSAGES.ERROR);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            {TEXT.HEADER}
          </h1>
          <p className="mt-4 text-xl text-gray-600">Manage and monitor all reports in the system</p>
        </div>

        {message && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 rounded-lg p-4 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{message}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 rounded-lg p-4 shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-semibold text-gray-900">{TEXT.REPORTS}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Verifications</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.length > 0 ? (
                    reports.map((report, index) => (
                      <tr key={report._id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors duration-150`}>
                        <td className="px-6 py-4 text-sm text-gray-900">{report.title}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full 
                            ${report.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                              report.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                              report.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {report.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {report.verificationCount}
                          {report.verifiedBy?.length > 0 && (
                            <span title={`Verified by: ${report.verifiedBy.join(', ')}`} className="ml-2 text-blue-600 cursor-pointer">
                              ({report.verifiedBy.length})
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium flex space-x-4">
                          <button
                            onClick={() => { setSelectedReport(report); setStatus(report.status); setComment(''); }}
                            className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                            title="Update Status"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(report._id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            title="Delete Report"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">No reports available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {selectedReport && (
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
              <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900">Update Report Status</h2>
              </div>
              <div className="px-6 py-5">
                <form onSubmit={handleStatusUpdate} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                      required
                    >
                      <option value="">Select status</option>
                      {Object.values(TEXT.STATUS).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors duration-200"
                      rows="3"
                      placeholder="Add a comment about the status update..."
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => { setSelectedReport(null); setStatus(''); setComment(''); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                    >
                      {TEXT.BUTTONS.SAVE}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;