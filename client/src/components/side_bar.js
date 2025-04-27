import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ShoppingCart, DollarSign, Box, User } from 'lucide-react';
import { useAuth } from './AuthProvider';
import './css/SideBar.css';

const LAT = 15.8646;
const LON = 120.8980;

const Sidebar = ({ handleOpenSignIn }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const user = JSON.parse(localStorage.getItem('user'));

  const [apiKey, setApiKey] = useState('');
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/weather-key') 
      .then(response => response.json())
      .then(data => setApiKey(data.apiKey));
  }, []);

  useEffect(() => {
    if (apiKey) {
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => setWeather(data));
    }
  }, [apiKey]);

  const handleSellingClick = () => {
    if (isAuthenticated) {
      navigate('/sell-area');
    } else {
      handleOpenSignIn();
    }
  };

  return (
    <aside className="sidebar">
      {}
      <div className="weather-widget">
        {weather ? (
          <div>
            <h4>{weather.name}</h4>
            <img src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`} alt="Weather Icon" />
            <p>{weather.weather[0].description}</p>
            <p>{weather.main.temp}°C</p>
          </div>
        ) : (
          <p>Loading weather...</p>
        )}
      </div>

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

      {user?.isAdmin && (
        <Link to="/manage-users" className="icon-button manage-users-button">
          <User className="icon" />
          <span className="text-sm">Manage Users</span>
        </Link>
      )}
    </aside>
  );
};

export default Sidebar;