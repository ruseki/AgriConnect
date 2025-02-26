//side_bar.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, DollarSign } from 'lucide-react';
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
      <Link to="/buying" className="icon-button">
        <ShoppingCart className="icon" />
        <span className="text-sm">Buying</span>
      </Link>
      <button className="icon-button" onClick={handleSellingClick}>
        <DollarSign className="icon" />
        <span className="text-sm">Selling</span>
      </button>
    </aside>
  );
};

export default SideBar;
