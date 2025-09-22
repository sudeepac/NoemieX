import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/auth.slice';

const ProtectedRoute = ({ children, requiredPortal = null, fallbackPath = '/login' }) => {
  const currentUser = useSelector(selectCurrentUser);
  const location = useLocation();

  // Check if user is authenticated
  if (!currentUser) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // Check if user has access to required portal
  if (requiredPortal && currentUser.portal !== requiredPortal) {
    const userPortalPath = `/${currentUser.portal}`;
    return <Navigate to={userPortalPath} replace />;
  }

  return children;
};

export default ProtectedRoute;