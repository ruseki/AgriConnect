import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? (
    <Component {...rest} />  // Render the component passed to the route
  ) : (
    <Navigate to="/" />  // Redirect if not authenticated
  );
};

export default ProtectedRoute;
