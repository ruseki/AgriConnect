//AuthProvider.js

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

/* localStorage.removeItem('authToken'); */

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  const validateToken = async (token) => {
    return !!token;
  };

  const login = (token, user) => {
    console.log('Saving user and token to localStorage:', user._id);
    if (!user._id) {
      console.error('Invalid user object, _id is undefined.');
      return;
    }

    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify({
      _id: user._id,
      userId: user.userId,
      email: user.email,
      isAdmin: user.isAdmin,
    }));

    setToken(token);
    setUserId(userId);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setToken(null);
    setUserId(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('user')); // Retrieve user object
      console.log('Retrieved token and user:', { token, user });
      if (token && userId) {
        const isValid = await validateToken(token);
        setToken(token);
        setUserId(user._id); // Use MongoDB _id
        setIsAuthenticated(isValid);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, userId, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};