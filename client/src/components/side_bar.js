import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, DollarSign, Box, User } from 'lucide-react';
import { useAuth } from './AuthProvider';
import './css/SideBar.css';

const SideBar = ({ handleOpenSignIn }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const user = JSON.parse(localStorage.getItem('user'));

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

      <Link to="/inventory" className="icon-button inventory-button">
        <Box className="icon" />
        <span className="text-sm">Inventory</span>
      </Link>

      {}
      {user?.isAdmin && (
        <Link to="/manage-users" className="icon-button manage-users-button">
          <User className="icon" />
          <span className="text-sm">Manage Users</span>
        </Link>
      )}
    </aside>
  );
};

export default SideBar;
