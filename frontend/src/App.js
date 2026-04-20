import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetail from './pages/EmployeeDetail';
import Tasks from './pages/Tasks';
import Analytics from './pages/Analytics';
import RoleSwitcher from './components/RoleSwitcher';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsAuthenticated(user.isAuthenticated || false);
  }, []);

  const handleSignIn = (userData) => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          {/* Public Route - Sign In */}
          <Route path="/signin" element={<SignIn onSignIn={handleSignIn} />} />
          
          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-6">
                      <RoleSwitcher />
                    </div>
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/employees" element={<Employees />} />
                      <Route path="/employees/:id" element={<EmployeeDetail />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/analytics" element={<Analytics />} />
                    </Routes>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
