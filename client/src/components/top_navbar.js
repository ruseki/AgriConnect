//top_navbar.js

import React, { useState, useEffect } from 'react';
import { Search, ShoppingCart, Bell, Globe, Menu } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { Link, useNavigate } from 'react-router-dom';
import './css/TopNavbar.css';

const TopNavbar = ({ handleOpenSignIn }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  useEffect(() => {
    console.log('TopNavbar - isAuthenticated:', isAuthenticated);
  }, [isAuthenticated]);

  if (isLoading) {
    console.log('TopNavbar - Loading...');
    return null;
  }

  return (
    <header className="top-navbar">
      <div className="navbar-container">
        <h1 className="navbar-title">AgriConnect</h1>
        <div className="navbar-search">
          <Search className="search-icon" />
          <input type="text" placeholder="Search in AgriConnect..." className="search-input" />
          {!isAuthenticated ? (
            <button className="sign-in-button" onClick={handleOpenSignIn}>
              Sign In
            </button>
          ) : (
            <div className="user-options">
              <button>
                <ShoppingCart className="icon" />
              </button>
              <button>
                <Bell className="icon" />
              </button>
              <div className="dropdown">
                <button className="dropdown-toggle" onClick={handleDropdownToggle}>
                  <Menu className="icon" />
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <button className="dropdown-item" onClick={() => navigate('/settings')}>
                      Settings
                    </button>
                    <button className="dropdown-item" onClick={logout}>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="language-toggle">
            <Globe className="icon" />
            <input type="checkbox" defaultChecked />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;
