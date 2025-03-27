import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';

const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        if (!user || user.role !== 'admin') {
          setError('You do not have permission to view statistics');
          setLoading(false);
          return;
        }

        const response = await axios.get('/api/admin/statistics');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error.response?.data || error.message);
        if (error.response?.status === 403) {
          setError('You do not have permission to view statistics');
        } else if (error.response?.status === 404) {
          setError('Statistics endpoint not found. Contact support.');
        } else {
          setError('Failed to fetch statistics. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg max-w-md">
          <p className="text-center">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg max-w-md">
          <p className="text-center">No statistics available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Dashboard Statistics
          </h2>
          <p className="mt-3 text-lg text-gray-500">
            Overview of system performance and user activity
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Report Statistics Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg transform transition duration-500 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 truncate">Report Statistics</h3>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Total Reports</span>
                  <span className="text-lg font-semibold text-gray-900">{stats.totalReports || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Verified Reports</span>
                  <span className="text-lg font-semibold text-green-600">{stats.verifiedReports || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Resolved Reports</span>
                  <span className="text-lg font-semibold text-blue-600">{stats.resolvedReports || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Avg Response Time</span>
                  <span className="text-lg font-semibold text-purple-600">{stats.averageResponseTime || 0} hours</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg transform transition duration-500 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 truncate">Category Distribution</h3>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {stats.categoryDistribution ? (
                  Object.entries(stats.categoryDistribution).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500 capitalize">{category}</span>
                      <span className="text-lg font-semibold text-gray-900">{count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center">No category data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Status Distribution Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg transform transition duration-500 hover:scale-105">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <h3 className="text-lg font-medium text-gray-900 truncate">Status Distribution</h3>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {stats.statusDistribution ? (
                  Object.entries(stats.statusDistribution).map(([status, count]) => (
                    <div key={status} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500 capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-lg font-semibold text-gray-900">{count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 text-center">No status data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;