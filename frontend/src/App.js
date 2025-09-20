import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './store/slices/auth.slice';
import ProtectedRoute from './components/common/protected-route.component';
import LoadingSpinner from './components/common/loading-spinner.component';

// Portal Components
import SuperadminPortal from './pages/portals/superadmin/superadmin.portal';
import AccountPortal from './pages/portals/account/account.portal';
import AgencyPortal from './pages/portals/agency/agency.portal';

// Auth Components
import LoginPage from './pages/auth/login.page';
import RegisterPage from './pages/auth/register.page';

// Landing Page
import LandingPage from './pages/landing/landing.page';

function App() {
  const dispatch = useDispatch();
  const { user, isLoading, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated on app load
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(checkAuth());
    }
  }, [dispatch]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to={`/${user?.portalType}`} replace />
            ) : (
              <LoginPage />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? (
              <Navigate to={`/${user?.portalType}`} replace />
            ) : (
              <RegisterPage />
            )
          } 
        />

        {/* Protected Portal Routes */}
        <Route
          path="/superadmin/*"
          element={
            <ProtectedRoute requiredPortal="superadmin">
              <SuperadminPortal />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/account/*"
          element={
            <ProtectedRoute requiredPortal="account">
              <AccountPortal />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/agency/*"
          element={
            <ProtectedRoute requiredPortal="agency">
              <AgencyPortal />
            </ProtectedRoute>
          }
        />

        {/* Redirect authenticated users to their portal */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Navigate to={`/${user?.portalType}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;