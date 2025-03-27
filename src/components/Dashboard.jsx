import React, { useState, useEffect, useCallback } from 'react';
import axios from '../config/axios';

const CATEGORIES = {
  corruption: { label: 'Corruption', bgColor: 'bg-red-50', textColor: 'text-red-800', borderColor: 'border-red-200', icon: '🚫' },
  services: { label: 'Services', bgColor: 'bg-green-50', textColor: 'text-green-800', borderColor: 'border-green-200', icon: '🔧' },
  infrastructure: { label: 'Infrastructure', bgColor: 'bg-blue-50', textColor: 'text-blue-800', borderColor: 'border-blue-200', icon: '🏗️' },
  administrative: { label: 'Administrative', bgColor: 'bg-purple-50', textColor: 'text-purple-800', borderColor: 'border-purple-200', icon: '📋' }
};

const CACHE_DURATION = 5 * 60 * 1000;

const Dashboard = () => {
  const [reports, setReports] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [notification, setNotification] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(5);

  const fetchData = useCallback(async (force = false) => {
    try {
      const now = Date.now();
      if (!force && lastFetch && (now - lastFetch < CACHE_DURATION)) return;

      const [reportsRes, budgetsRes] = await Promise.all([
        axios.get('/api/reports'),
        axios.get('/api/budgets')
      ]);

      setReports(reportsRes.data || []);
      setBudgets(budgetsRes.data || []);
      setLastFetch(now);
      setLoading(false);
    } catch (err) {
      console.error('Fetch data error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to fetch data');
      setLoading(false);
    }
  }, [lastFetch]);

  useEffect(() => {
    fetchData(true);
    const pollInterval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(pollInterval);
  }, [fetchData]);

  const showNotification = useCallback((message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const handleVerify = useCallback(async (reportId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      setError('Please log in to verify reports');
      return;
    }

    if (!window.confirm('Are you sure you want to verify this report?')) return;

    try {
      const response = await axios.post(`/api/reports/${reportId}/verify`, { phoneNumber: user.phoneNumber });
      setReports(prev => prev.map(r => r._id === reportId ? response.data : r));
      showNotification('Report verified successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify report');
    }
  }, [showNotification]);

  const handleUndoVerify = useCallback(async (reportId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    try {
      const response = await axios.post(`/api/reports/${reportId}/undo-verify`, { phoneNumber: user.phoneNumber });
      setReports(prev => prev.map(r => r._id === reportId ? response.data : r));
      showNotification('Verification undone successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to undo verification');
    }
  }, [showNotification]);

  const getFilteredReports = useCallback(() => {
    return reports.filter(report => selectedCategory === 'all' || report.category === selectedCategory);
  }, [reports, selectedCategory]);

  const filteredReports = getFilteredReports();
  const verifiedReports = filteredReports.filter(report => report.verified);
  const unverifiedReports = filteredReports.filter(report => !report.verified);

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentVerifiedReports = verifiedReports.slice(indexOfFirstReport, indexOfLastReport);
  const currentUnverifiedReports = unverifiedReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const ReportCard = ({ report }) => {
    const categoryStyle = CATEGORIES[report.category] || CATEGORIES.administrative;
    const user = JSON.parse(localStorage.getItem('user'));
    const hasVerified = user && report.verifiedBy?.includes(user.phoneNumber);
    const isSubmitter = user && report.createdBy === user.phoneNumber;
    const canUndo = hasVerified && report.verificationTimestamps?.find(v => v.phoneNumber === user.phoneNumber && (new Date() - new Date(v.timestamp)) / (1000 * 60 * 60) <= 1);
    const [isExpanded, setIsExpanded] = useState(false);

    const truncatedTitle = report.title.length > 100 ? report.title.substring(0, 100) + '...' : report.title;
    const descriptionLines = report.description.split('\n');
    const shortDescription = descriptionLines.slice(0, 3).join('\n');
    const hasMoreLines = descriptionLines.length > 3;
    
    return (
      <div className={`${categoryStyle.bgColor} border-l-4 ${categoryStyle.borderColor} rounded-lg p-4 mb-4 shadow-sm hover:shadow-md transition-shadow duration-300`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span>{categoryStyle.icon}</span>
              <h3 className="text-lg font-semibold text-gray-900">{truncatedTitle}</h3>
            </div>
            <div className="mt-1">
              <p className="text-sm text-gray-600 whitespace-pre-line">
                {isExpanded ? report.description : shortDescription}
              </p>
              {hasMoreLines && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-sm text-blue-600 hover:text-blue-800 mt-1"
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded-full ${categoryStyle.bgColor} ${categoryStyle.textColor}`}>
                {categoryStyle.label}
              </span>
              {report.verified ? (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Verified by Community
                </span>
              ) : (
                <>
                <button
                  onClick={() => handleVerify(report._id)}
                    disabled={!user || hasVerified || isSubmitter}
                    className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 transition-all duration-300 ${
                      !user
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : hasVerified
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : isSubmitter
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-green-100 text-green-800 hover:bg-green-200 active:bg-green-300'
                    }`}
                    title={!user ? 'Log in to Verify' : hasVerified ? 'Already Verified' : isSubmitter ? 'Cannot Verify Own Report' : `Verify (${report.verificationCount}/3)`}
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.5-2.5a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" />
                    </svg>
                    {!user ? 'Log in' : hasVerified ? 'Verified' : isSubmitter ? 'Own Report' : `Verify (${report.verificationCount}/3)`}
                  </button>
                  {canUndo && (
                    <button
                      onClick={() => handleUndoVerify(report._id)}
                      className="text-xs px-2 py-1 rounded-full flex items-center gap-1 bg-yellow-100 text-yellow-800 hover:bg-yellow-200 transition-all duration-200"
                      title="Undo Verification (within 1 hour)"
                    >
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                      Undo
                </button>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="text-right ml-4">
            <span className="text-sm text-gray-500 block">
              {new Date(report.createdAt).toLocaleDateString()}
            </span>
            {report.verifiedAt && (
              <span className="text-xs text-green-600 block">
                Verified on {new Date(report.verifiedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const BudgetCard = ({ budget }) => {
    if (!budget) return null;
    const percentage = budget.allocated > 0 ? (budget.spent / budget.allocated) * 100 : 0;
    const isOverBudget = percentage > 100;

    return (
      <div className="border rounded-lg p-4 hover:shadow-md transition-all duration-200">
        <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
        <div className="mt-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Allocated:</span>
            <span className="font-medium">${budget.allocated.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-500">Spent:</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : ''}`}>
              ${budget.spent.toLocaleString()}
            </span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${isOverBudget ? 'bg-red-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-right mt-1 text-gray-500">
              {percentage.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="text-center py-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading data...</p>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-8">
      <div className="text-red-600 mb-2">{error}</div>
      <button onClick={() => window.location.reload()} className="text-blue-600 hover:text-blue-800">
        Try again
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {notification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50 flex items-center gap-2">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {notification}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === key ? `${cat.bgColor} ${cat.textColor}` : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              Unverified Reports
              <span className="text-sm font-normal text-gray-500">({unverifiedReports.length})</span>
            </h2>
            <div className="space-y-4">
              {currentUnverifiedReports.map(report => (
                <ReportCard key={report._id} report={report} />
              ))}
              {unverifiedReports.length === 0 && (
                <p className="text-gray-500 text-center py-4">No unverified reports</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              Verified Reports
              <span className="text-sm font-normal text-gray-500">({verifiedReports.length})</span>
            </h2>
            <div className="space-y-4">
              {currentVerifiedReports.map(report => (
                <ReportCard key={report._id} report={report} />
              ))}
              {verifiedReports.length === 0 && (
                <p className="text-gray-500 text-center py-4">No verified reports</p>
              )}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => paginate(index + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === index + 1 ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Budget Overview</h2>
            <div className="space-y-4">
              {budgets.length > 0 ? (
                budgets.map(budget => <BudgetCard key={budget._id} budget={budget} />)
              ) : (
                <p className="text-gray-500 text-center py-4">No budget data available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Move styles to global CSS or a CSS module */}
    </div>
  );
};

export default Dashboard;