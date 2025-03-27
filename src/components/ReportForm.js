import React, { useState, useEffect } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = {
  corruption: {
    label: 'Corruption',
    description: 'Report cases of bribery, misuse of funds, or nepotism',
    bgColor: 'bg-red-50',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    icon: '🚫'
  },
  services: {
    label: 'Services',
    description: 'Issues with water, electricity, or waste management',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    icon: '🔧'
  },
  infrastructure: {
    label: 'Infrastructure',
    description: 'Problems with roads, buildings, or public facilities',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800',
    borderColor: 'border-blue-200',
    icon: '🏗️'
  },
  administrative: {
    label: 'Administrative',
    description: 'Issues with documentation, licensing, or public service',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-800',
    borderColor: 'border-purple-200',
    icon: '📋'
  }
};

const ReportForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVerified, setIsVerified] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        if (!token) {
          setError('Please log in to submit reports');
          setIsVerified(false);
          return;
        }

        const response = await axios.get('/api/auth/verify-status');
        const userData = response.data;
        console.log('User data:', userData);
        setIsVerified(userData.isVerified);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        console.error('Verification error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to verify your account. Please log in again.');
        setIsVerified(false);
      } finally {
        setLoading(false);
      }
    };
    checkVerification();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'title' && value.length > 100) return;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (isVerified === null) {
      setError('Checking verification status. Please wait.');
      return;
    }

    if (!isVerified) {
      setError('Please verify your phone number to submit reports');
      return;
    }

    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long');
      return;
    }

    if (formData.description.trim().length < 20) {
      setError('Description must be at least 20 characters long');
      return;
    }

    try {
      const response = await axios.post('/api/reports', {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim()
      });

      if (response.data) {
        setSuccess(true);
        setFormData({ title: '', description: '', category: '' });
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to submit report. Please try again.';
      setError(errorMessage);
      console.error('Submission error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-6">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Submit a Report</h2>
          <p className="text-gray-600 mb-8">
            Submitting a report helps track and address issues in the system.
          </p>

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg animate-fade-in">
              Report submitted successfully! Redirecting to dashboard...
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Category
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(CATEGORIES).map(([key, category]) => (
                  <label
                    key={key}
                    className={`
                      relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                      ${formData.category === key 
                        ? `${category.bgColor} ${category.borderColor}` 
                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}
                    `}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={key}
                      checked={formData.category === key}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{category.icon}</span>
                      <div>
                        <p className={`font-medium ${formData.category === key ? category.textColor : 'text-gray-900'}`}>
                          {category.label}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    {formData.category === key && (
                      <div className="absolute top-2 right-2">
                        <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
                <span className="text-sm text-gray-500 ml-2">
                  ({formData.title.length}/100 characters)
                </span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Brief title for your report"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="Detailed description of the issue"
              />
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-lg transition-colors duration-200 ${
                formData.category && isVerified
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-100 cursor-not-allowed text-gray-500'
              }`}
              disabled={!formData.category || !isVerified}
            >
              Submit Report
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportForm;