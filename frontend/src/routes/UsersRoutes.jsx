import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { LoadingSpinner } from '../shared';

// Lazy load user-related components
const UsersList = lazy(() => import('../pages/users/UsersList'));
const UserDetail = lazy(() => import('../pages/users/UserDetail'));
const UserCreate = lazy(() => import('../pages/users/UserCreate'));
const UserEdit = lazy(() => import('../pages/users/UserEdit'));
const UserProfile = lazy(() => import('../pages/users/UserProfile'));

/**
 * Users Routes - Model-driven routing for User CRUD operations
 * Aligned with users.slice.js async thunks:
 * - fetchUsers, fetchUserById, createUser, updateUser, deleteUser, toggleUserStatus, changeUserPassword
 */
const UsersRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading users..." />}>
      <Routes>
        {/* Users List - GET /users */}
        <Route index element={<UsersList />} />
        
        {/* Create User - POST /users */}
        <Route path="create" element={<UserCreate />} />
        
        {/* User Detail - GET /users/:id */}
        <Route path=":userId" element={<UserDetail />} />
        
        {/* Edit User - PUT /users/:id */}
        <Route path=":userId/edit" element={<UserEdit />} />
        
        {/* User Profile - GET /users/:id (read-only view) */}
        <Route path=":userId/profile" element={<UserProfile />} />
        
        {/* Redirect unknown routes to users list */}
        <Route path="*" element={<Navigate to="/users" replace />} />
      </Routes>
    </Suspense>
  );
};

export default UsersRoutes;