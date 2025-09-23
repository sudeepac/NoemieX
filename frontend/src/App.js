import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useCheckAuthQuery } from './store/api/authApi';
import { setCredentials, setLoading, initializeAuth, clearCredentials } from './store/slices/auth.slice';
import LoadingSpinner from './components/common/loading-spinner.component';

// Main routing component
import { AppRoutes } from './router';

function App() {
  const dispatch = useDispatch();
  const { user, isLoading, isAuthenticated, token } = useSelector((state) => state.auth);
  
  // Initialize auth state from localStorage
  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  // Use RTK Query to check auth when token exists
  const { data: authData, error, isLoading: isCheckingAuth } = useCheckAuthQuery(undefined, {
    skip: !token, // Skip query if no token
  });

  // Handle auth check results
  useEffect(() => {
    if (authData) {
      dispatch(setCredentials(authData));
    }
    if (error) {
      // Token is invalid, clear credentials
      dispatch(clearCredentials());
    }
  }, [authData, error, dispatch]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="app">
      <AppRoutes />
    </div>
  );
}

export default App;