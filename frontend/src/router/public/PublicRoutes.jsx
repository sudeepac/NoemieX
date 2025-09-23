import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/auth.slice';
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  LandingPage
} from '../shared/LazyComponents';

/**
 * PublicRoutes - Routes accessible without authentication
 * 
 * Handles:
 * - Landing page
 * - Authentication pages (login, register, forgot password)
 * - Redirects authenticated users to their portal
 * 
 * // AI-NOTE: Public routes following React Router v6 patterns with automatic redirection.
 * // Authenticated users are redirected to their portal to prevent access to auth pages.
 * // All components are lazy-loaded for optimal performance.
 */
const PublicRoutes = () => {
  const currentUser = useSelector(selectCurrentUser);

  // If user is authenticated, redirect to their portal
  if (currentUser) {
    const portalPath = `/${currentUser.portal}`;
    return <Navigate to={portalPath} replace />;
  }

  return (
    <Suspense fallback={<div className="loading-spinner">Loading...</div>}>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Catch-all redirect to landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default PublicRoutes;