import React, { useState } from 'react';
import axios from '../config/axios';
import { useNavigate } from 'react-router-dom';

const Signup = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [tempUserId, setTempUserId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('/api/auth/signup', { phoneNumber });
      setTempUserId(response.data.tempUserId);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('/api/auth/verify-signup', { tempUserId, otp });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">{error}</div>}
        {success && !tempUserId && <div className="mb-4 p-3 bg-green-50 text-green-700 rounded">Account created! Redirecting...</div>}

        {!tempUserId ? (
          <form onSubmit={handlePhoneSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+1234567890"
                required
              />
            </div>
            <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Send OTP</button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="6-digit OTP"
                required
              />
            </div>
            <button type="submit" className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Verify OTP</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;