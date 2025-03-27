import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';
import VerifyPhone from './components/VerifyPhone';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';
import Home from './components/Home';
import Statistics from './components/Statistics';
import About from './components/About';
import Navbar from './components/Navbar';
import { AuthProvider, useAuth } from './context/AuthContext';

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/report"
          element={user ? <ReportForm user={user} /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/verify"
          element={user ? <VerifyPhone user={user} /> : <Navigate to="/auth" replace />}
        />
        <Route
          path="/auth/*"
          element={!user ? <Auth /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/admin"
          element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" replace />}
        />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <Router>
      <ErrorBoundary>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50">
            <main>
              <AppRoutes />
            </main>
          </div>
        </AuthProvider>
      </ErrorBoundary>
    </Router>
  );
};

export default App;