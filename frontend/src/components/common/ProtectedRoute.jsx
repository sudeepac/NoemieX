import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredPortal, requiredRole }) => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredPortal && user?.portalType !== requiredPortal) {
    // Redirect to user's correct portal
    return <Navigate to={`/${user?.portalType}`} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="access-denied">
        <div className="access-denied__container">
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
          <button 
            onClick={() => window.history.back()}
            className="btn btn--primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;