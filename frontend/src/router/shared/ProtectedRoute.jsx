import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/auth.slice';

/**
 * ProtectedRoute - Wrapper component for authenticated routes
 * 
 * @param {React.ReactNode} children - Components to render if authenticated
 * @param {string|null} requiredPortal - Required portal access (superadmin, account, agency)
 * @param {string} fallbackPath - Redirect path if not authenticated
 * 
 * // AI-NOTE: Centralized authentication wrapper following React Router v6 patterns.
 * // Handles both authentication check and portal-specific access control.
 * // Used by all protected routes to ensure consistent auth behavior.
 */
const ProtectedRoute = ({ children, requiredPortal = null, fallbackPath = '/login' }) => {
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has access to required portal
  // AI-NOTE: Fixed to use portalType instead of portal to match backend response
  if (requiredPortal && currentUser.portalType !== requiredPortal) {
    const userPortalPath = `/${currentUser.portalType}`;
    return <Navigate to={userPortalPath} replace />;
  }

  return children;
};

export default ProtectedRoute;