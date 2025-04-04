// side_bar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, DollarSign, Box } from 'lucide-react'; // Added Box icon for Inventory
import { useAuth } from './AuthProvider';
import './css/SideBar.css';

const SideBar = ({ handleOpenSignIn }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleSellingClick = () => {
    if (isAuthenticated) {
      navigate('/sell-area');
    } else {
      handleOpenSignIn();
    }
  };

  return (
    <aside className="sidebar">
      <Link to="/" className="icon-button">
        <Home className="icon" />
        <span className="text-sm">Home</span>
      </Link>
      <Link to="/buy-area" className="icon-button">
        <ShoppingCart className="icon" />
        <span className="text-sm">Buying</span>
      </Link>
      <button className="icon-button" onClick={handleSellingClick}>
        <DollarSign className="icon" />
        <span className="text-sm">Selling</span>
      </button>

      {/* Inventory Button at the Bottom */}
      <Link to="/inventory" className="icon-button inventory-button">
        <Box className="icon" />
        <span className="text-sm">Inventory</span>
      </Link>
    </aside>
  );
};

export default SideBar;
