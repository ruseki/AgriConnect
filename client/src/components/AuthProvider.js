import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

localStorage.removeItem('authToken'); 


export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = async (token) => {

    return !!token;
  };

  const login = (token) => {
    console.log('Setting auth token:', token);
    localStorage.setItem('authToken', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      console.log('Retrieved token:', token);
      if (token) {
        const isValid = await validateToken(token);
        console.log('Token is valid:', isValid);
        setIsAuthenticated(isValid);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
