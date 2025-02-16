import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';

const ProtectedRoute = ({ element: Component, ...rest }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? ( // idk 
    <Component {...rest} />
  ) : (
    <Navigate to="/" /> 
  );
};


export default ProtectedRoute;