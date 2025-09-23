import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/auth.slice';

// Import route components
import PublicRoutes from './public/PublicRoutes';
import SuperadminRoutes from './portals/SuperadminRoutes';
import AccountRoutes from './portals/AccountRoutes';
import AgencyRoutes from './portals/AgencyRoutes';

/**
 * AppRoutes - Main routing component for the application
 * 
 * Route Structure:
 * - /* -> Public routes (landing, auth) when not authenticated
 * - /superadmin/* -> Superadmin portal routes
 * - /account/* -> Account portal routes
 * - /agency/* -> Agency portal routes
 * 
 * // AI-NOTE: Main router following React Router v6 patterns with portal-based organization.
 * // Automatically redirects users to their appropriate portal based on authentication.
 * // Follows the new /router folder structure with separated concerns.
 * // FIXED: Changed currentUser.portal to currentUser.portalType to match backend response structure.
 */
const AppRoutes = () => {
  const currentUser = useSelector(selectCurrentUser);

  return (
    <Routes>
      {/* Public Routes - Available when not authenticated */}
      <Route path="/*" element={<PublicRoutes />} />
      
      {/* Portal Routes - Available when authenticated */}
      <Route path="/superadmin/*" element={<SuperadminRoutes />} />
      <Route path="/account/*" element={<AccountRoutes />} />
      <Route path="/agency/*" element={<AgencyRoutes />} />
      
      {/* Default redirect for authenticated users */}
      {currentUser && (
        <Route 
          path="*" 
          element={<Navigate to={`/${currentUser.portalType}`} replace />} 
        />
      )}
    </Routes>
  );
};

export default AppRoutes;