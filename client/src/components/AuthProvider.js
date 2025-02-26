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

  const login = (token, userId) => {
    console.log('Setting auth token:', token);  
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);  
    setToken(token);  
    setUserId(userId);  
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');  
    setToken(null);  
    setUserId(null);  
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');  
      console.log('Retrieved token:', token);
      if (token) {
        const isValid = await validateToken(token);
        console.log('Token is valid:', isValid);
        setToken(token);  
        setUserId(userId);  
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
