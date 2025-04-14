import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const AdminRoutes = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true'; // Check admin status
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      console.log('Non-admin user detected. Redirecting to homepage...');
      navigate('/', { replace: true }); // Redirect non-admin users
    }
  }, [isAdmin, navigate]);

  return isAdmin ? children : null; // Render only if user is an admin
};

export default AdminRoutes;