import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import {
  UsersList,
  UserDetail,
  UserCreate,
  UserEdit,
  UserProfile
} from '../shared/LazyComponents';

/**
 * UsersRoutes - Model-based routes for Users CRUD operations
 * 
 * Route Structure:
 * - /users -> List all users
 * - /users/create -> Create new user
 * - /users/:id -> View user details
 * - /users/:id/edit -> Edit user
 * - /users/profile -> Current user profile
 * 
 * // AI-NOTE: Users model routes following RESTful patterns and Redux slice structure.
 * // Aligned with usersSlice actions: fetchUsers, createUser, updateUser, deleteUser.
 * // Each route corresponds to specific CRUD operations as defined in MODEL_ROUTES_MAPPING.md.
 */
const UsersRoutes = () => {
  return (
    <Suspense fallback={<div className="loading-spinner">Loading Users...</div>}>
      <Routes>
        {/* List View - GET /users */}
        <Route index element={<UsersList />} />
        
        {/* Create View - POST /users */}
        <Route path="create" element={<UserCreate />} />
        
        {/* Profile View - Current User */}
        <Route path="profile" element={<UserProfile />} />
        
        {/* Detail View - GET /users/:id */}
        <Route path=":id" element={<UserDetail />} />
        
        {/* Edit View - PUT /users/:id */}
        <Route path=":id/edit" element={<UserEdit />} />
      </Routes>
    </Suspense>
  );
};

export default UsersRoutes;