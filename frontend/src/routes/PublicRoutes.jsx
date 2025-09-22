import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/auth.slice';

// Public components
import Landing from '../pages/landing/landing.page';
import Login from '../pages/auth/login.page';
import Register from '../pages/auth/register.page';

const PublicRoutes = () => {
  const currentUser = useSelector(selectCurrentUser);

  // Redirect authenticated users to their portal
  if (currentUser) {
    const portalPath = `/${currentUser.portal}`;
    return <Navigate to={portalPath} replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default PublicRoutes;