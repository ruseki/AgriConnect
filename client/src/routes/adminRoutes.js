import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

const AdminRoutes = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true'; 
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      console.log('Non-admin user detected. Redirecting to homepage...');
      navigate('/', { replace: true }); 
    }
  }, [isAdmin, navigate]);

  return isAdmin ? children : null; 
};

export default AdminRoutes;