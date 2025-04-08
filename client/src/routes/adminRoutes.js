//adminRoutes.js

import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoutes = ({ children }) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true'; 
  console.log('isAdmin:', isAdmin); 

  return isAdmin ? children : <Navigate to="/" />; 
};

export default AdminRoutes;