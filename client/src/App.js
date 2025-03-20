import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './components/HomePage';
import SellArea from './pages/SellArea';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoutes';
import BuyArea from './pages/BuyArea';
import CartArea from './pages/CartArea';
import Profile from './pages/Profile'; 
import './App.css';
import { AuthProvider } from './components/AuthProvider';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sell-area" element={<ProtectedRoute element={SellArea} />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/buy-area" element={<ProtectedRoute element={BuyArea} />} />
          <Route path="/cart" element={<ProtectedRoute element={CartArea} />} />
          <Route path="/profile" element={<ProtectedRoute element={Profile} />} /> {}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
