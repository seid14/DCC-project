import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from '../config/axios';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useAuth } from '../context/AuthContext';

const TEXT = {
  HEADER: 'Welcome to Degahbur City Center',
  SUBTITLE: 'Sign up or log in to continue',
  LABELS: {
    PHONE: 'Phone Number',
    PHONE_PLACEHOLDER: 'Enter your phone number',
    OTP: 'Verification Code',
    OTP_PLACEHOLDER: 'Enter the 6-digit code',
    SUBMIT: 'Continue',
    VERIFY: 'Verify',
    RESEND: 'Resend Code',
    SWITCH_MODE: 'Switch to {mode}',
    ADMIN_MODE: 'Admin Login'
  },
  MESSAGES: {
    SIGNUP_SUCCESS: 'Account created! Please verify the OTP.',
    LOGIN_SUCCESS: 'Logged in successfully!',
    OTP_SENT: 'OTP sent successfully!',
    OTP_VERIFIED: 'Phone number verified successfully!',
    LOGIN_COMPLETE: 'Logged in successfully!'
  },
  ERRORS: {
    GENERIC: 'An error occurred. Please try again.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    INVALID_OTP: 'Invalid OTP. Please try again.',
    OTP_EXPIRED: 'OTP has expired. Please request a new one.',
    ADMIN_ACCESS: 'Admin access required.'
  }
};

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const isAdminRoute = location.pathname === '/auth/admin';
  const [mode, setMode] = useState(isAdminRoute ? 'login' : 'signup');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [tempUserId, setTempUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showOtp, setShowOtp] = useState(false);

  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
    const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';

    try {
      const response = await axios.post(endpoint, { phoneNumber: formattedPhone });
      console.log(`${mode} response:`, response.data);

      if (response.data.token && response.data.user) {
        login(response.data.token, response.data.user);
        setMessage(TEXT.MESSAGES.LOGIN_COMPLETE);
        setTimeout(() => navigate(response.data.user.role === 'admin' ? '/admin' : '/dashboard'), 1000);
      } else {
        setTempUserId(response.data.tempUserId || response.data.userId);
        setShowOtp(true);
        setPhoneNumber(formattedPhone);
        setMessage(TEXT.MESSAGES.OTP_SENT);
      }
    } catch (error) {
      console.error(`${mode} error:`, error.response?.data || error);
      setError(error.response?.data?.error || TEXT.ERRORS.GENERIC);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const endpoint = mode === 'signup' ? '/api/auth/verify-signup' : '/api/auth/verify-login';
    const payload = mode === 'signup' ? { tempUserId, otp } : { userId: tempUserId, otp };

    try {
      const response = await axios.post(endpoint, payload);
      console.log('OTP verification response:', response.data);

      if (response.data.token && response.data.user) {
        login(response.data.token, response.data.user);
        setMessage(mode === 'signup' ? TEXT.MESSAGES.SIGNUP_SUCCESS : TEXT.MESSAGES.LOGIN_COMPLETE);
        setTimeout(() => navigate(response.data.user.role === 'admin' ? '/admin' : '/dashboard'), 1000);
      } else {
        setError(TEXT.ERRORS.INVALID_OTP);
      }
    } catch (error) {
      console.error('OTP verification error:', error.response?.data || error);
      setError(error.response?.data?.error || TEXT.ERRORS.INVALID_OTP);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    const endpoint = mode === 'signup' ? '/api/auth/signup' : '/api/auth/login';

    try {
      const response = await axios.post(endpoint, { phoneNumber });
      setTempUserId(response.data.tempUserId || response.data.userId);
      setMessage(TEXT.MESSAGES.OTP_SENT);
    } catch (error) {
      console.error('Resend OTP error:', error.response?.data || error);
      setError(error.response?.data?.error || TEXT.ERRORS.GENERIC);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {TEXT.HEADER}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {TEXT.SUBTITLE}
          </p>
        </div>

        {/* Toggle Buttons */}
        {!isAdminRoute && !showOtp && (
          <div className="flex mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-lg font-semibold ${mode === 'login' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-l-md`}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 text-lg font-semibold ${mode === 'signup' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'} rounded-r-md`}
            >
              Sign Up
            </button>
          </div>
        )}

        {message && (
          <div className="rounded-md bg-green-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 0 00-1.414 1.414l2 2a1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{message}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 0 101.414 1.414L10 11.414l1.293 1.293a1 0 001.414-1.414L11.414 10l1.293-1.293a1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!showOtp ? (
          <Routes>
            <Route path="/" element={
              <form className="mt-8 space-y-6" onSubmit={handlePhoneSubmit}>
                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="phone" className="sr-only">
                      {TEXT.LABELS.PHONE}
                    </label>
                    <PhoneInput
                      country={'et'}
                      value={phoneNumber}
                      onChange={setPhoneNumber}
                      inputProps={{
                        name: 'phoneNumber',
                        required: true,
                        className: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg p-3 ml-2'
                      }}
                      containerClass="phone-input"
                      buttonClass="phone-input__button"
                      dropdownClass="phone-input__dropdown"
                      searchClass="phone-input__search"
                      searchPlaceholder="Search country..."
                      enableSearch={true}
                      disableSearchIcon={false}
                      searchNotFound="No country found"
                      placeholder={TEXT.LABELS.PHONE_PLACEHOLDER}
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      TEXT.LABELS.SUBMIT
                    )}
                  </button>
                </div>
              </form>
            } />
            <Route path="/admin" element={
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{TEXT.LABELS.ADMIN_MODE}</h3>
                <form className="mt-8 space-y-6" onSubmit={handlePhoneSubmit}>
                  <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                      <label htmlFor="phone" className="sr-only">
                        {TEXT.LABELS.PHONE}
                      </label>
                      <PhoneInput
                        country={'et'}
                        value={phoneNumber}
                        onChange={setPhoneNumber}
                        inputProps={{
                          name: 'phoneNumber',
                          required: true,
                          className: 'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-lg p-3 ml-2'
                        }}
                        containerClass="phone-input"
                        buttonClass="phone-input__button"
                        dropdownClass="phone-input__dropdown"
                        searchClass="phone-input__search"
                        searchPlaceholder="Search country..."
                        enableSearch={true}
                        disableSearchIcon={false}
                        searchNotFound="No country found"
                        placeholder={TEXT.LABELS.PHONE_PLACEHOLDER}
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        TEXT.LABELS.SUBMIT
                      )}
                    </button>
                  </div>
                </form>
              </div>
            } />
          </Routes>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="otp" className="sr-only">
                  {TEXT.LABELS.OTP}
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 text-lg"
                  placeholder={TEXT.LABELS.OTP_PLACEHOLDER}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  TEXT.LABELS.VERIFY
                )}
              </button>
            </div>

            <div className="text-sm text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
              >
                {TEXT.LABELS.RESEND}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;