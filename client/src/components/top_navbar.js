import React, { useState, useEffect } from "react";
import { Search, ShoppingCart, Bell, Menu, Wallet } from "lucide-react"; 
import { useAuth } from "./AuthProvider";
import { Link, useNavigate } from "react-router-dom";
import "./css/TopNavbar.css";

const TopNavbar = ({ handleOpenSignIn, onSearch }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDropdownToggle = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const calculateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
    setCartCount(totalItems);
  };

  useEffect(() => {
    if (isAuthenticated) {
      calculateCartCount();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    if (onSearch) {
      onSearch(event.target.value); 
    }
  };

  const handleSearchKeyPress = (event) => {
    if (event.key === "Enter" && onSearch) {
      onSearch(searchQuery); 
    }
  };

  if (isLoading) {
    console.log("TopNavbar - Loading...");
    return null;
  }


  return (
    <header className="top-navbar">
      <div className="navbar-container">
        <h1 className="navbar-title">AgriConnect</h1>
        <div className="navbar-search">
          
          <input
  type="text"
  placeholder="Search in AgriConnect..."
  className="search-input"
  value={searchQuery}
  onChange={(e) => {
    setSearchQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value); 
    }
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(searchQuery); 
    }
  }}
/>
          {!isAuthenticated ? (
            <button className="sign-in-button" onClick={handleOpenSignIn}>
              Sign In
            </button>
          ) : (
            <div className="user-options">
              <Link to="/cart">
                <button className="icon-button">
                  <ShoppingCart className="icon" />
                  {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                </button>
              </Link>
              <button className="icon-button">
                <Bell className="icon" />
              </button>
              <button className="icon-button" onClick={() => navigate("/withdraw")}>
                <Wallet className="icon" />
              </button>
              <div className="dropdown">
                <button className="dropdown-toggle" onClick={handleDropdownToggle}>
                  <Menu className="icon" />
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-section">
                      <button className="dropdown-item" onClick={() => navigate("/profile")}>
                        Profile
                      </button>
                      <button className="dropdown-item" onClick={() => navigate("/settings")}>
                        Settings
                      </button>
                    </div>
                    <div className="dropdown-divider"></div>
                    <div className="dropdown-section">
                      <button className="dropdown-item" onClick={handleLogout}>
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNavbar;