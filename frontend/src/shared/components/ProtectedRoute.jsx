import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissions } from '../hooks/usePermissions';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute component that enforces business rules for access control
 * Supports portal-based access, role requirements, and data scoping
 */
const ProtectedRoute = ({ 
  children, 
  requiredPortal = null,
  requiredRole = null,
  requireAuth = true,
  fallbackPath = '/login'
}) => {
  const location = useLocation();
  const { 
    user, 
    hasPortalAccess, 
    hasRole: checkRole,
    isSuperadmin,
    isAccountUser,
    isAgencyUser
  } = usePermissions();

  // Show loading while auth state is being determined
  if (requireAuth && user === undefined) {
    return <LoadingSpinner />;
  }

  // Redirect to login if authentication required but user not logged in
  if (requireAuth && !user) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check portal access if required
  if (requiredPortal && !hasPortalAccess(requiredPortal)) {
    // Redirect to appropriate portal dashboard
    const redirectPath = getPortalRedirectPath(user);
    return <Navigate to={redirectPath} replace />;
  }

  // Check role requirements if specified
  if (requiredRole && !checkRole(requiredRole)) {
    // Redirect to unauthorized page or portal dashboard
    const redirectPath = getPortalRedirectPath(user);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

/**
 * Get appropriate redirect path based on user's portal
 */
const getPortalRedirectPath = (user) => {
  if (!user) return '/login';
  
  switch (user.portal) {
    case 'superadmin':
      return '/superadmin/dashboard';
    case 'account':
      return '/account/dashboard';
    case 'agency':
      return '/agency/dashboard';
    default:
      return '/login';
  }
};

/**
 * Higher-order component for portal-specific route protection
 */
export const SuperadminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredPortal="superadmin" {...props}>
    {children}
  </ProtectedRoute>
);

export const AccountRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredPortal="account" {...props}>
    {children}
  </ProtectedRoute>
);

export const AgencyRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredPortal="agency" {...props}>
    {children}
  </ProtectedRoute>
);

/**
 * Role-based route protection
 */
export const AdminRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="admin" {...props}>
    {children}
  </ProtectedRoute>
);

export const ManagerRoute = ({ children, ...props }) => (
  <ProtectedRoute requiredRole="manager" {...props}>
    {children}
  </ProtectedRoute>
);

export default ProtectedRoute;