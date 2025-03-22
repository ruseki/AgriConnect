/* adminDashboard.js */

import React from 'react';
import './css/adminDashboard.css';
import SideBar from '../components/side_bar'; 
import TopNavbar from '../components/top_navbar'; 
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const AdminDashboard = () => {
  const totalUsers = 15;
  const onlineUsers = 3;
  const verifiedSellers = 2;
  const totalUsersPercent = 15; 
  const onlineUsersPercent = 3;
  const verifiedSellersPercent = 2;

  return (
    <div className="admin-dashboard-container">
      <TopNavbar />
      <div className="dashboard-content">
        <SideBar />
        <div className="dashboard-main">
          <div className="admin-dashboard">
            <h1>Admin Panel</h1>
            <p>No backend yet, example values only.</p>
          </div>

          {}
          <div className="stats-container">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{totalUsers}</p>
              <div className="small-circular">
                <CircularProgressbar
                  value={totalUsersPercent}
                  text={`${totalUsersPercent}%`}
                  styles={buildStyles({
                    textSize: '28px',
                    textColor: '#4D7C2E',
                    pathColor: '#4D7C2E',
                    trailColor: '#f5f5f5',
                  })}
                />
              </div>
            </div>
            <div className="stat-card">
              <h3>Online Users</h3>
              <p>{onlineUsers}</p>
              <div className="small-circular">
                <CircularProgressbar
                  value={onlineUsersPercent}
                  text={`${onlineUsersPercent}%`}
                  styles={buildStyles({
                    textSize: '28px',
                    textColor: '#4D7C2E',
                    pathColor: '#4D7C2E',
                    trailColor: '#f5f5f5',
                  })}
                />
              </div>
            </div>
            <div className="stat-card">
              <h3>Verified Sellers</h3>
              <p>{verifiedSellers}</p>
              <div className="small-circular">
                <CircularProgressbar
                  value={verifiedSellersPercent}
                  text={`${verifiedSellersPercent}%`}
                  styles={buildStyles({
                    textSize: '28px',
                    textColor: '#007bff',
                    pathColor: '#007bff',
                    trailColor: '#f5f5f5',
                  })}
                />
              </div>
            </div>
          </div>

          {}
          <div className="admin-sections">
            <button className="admin-button">Manage Users</button>
            <button className="admin-button" onClick={() => (window.location.href = '/manage-tickets')}>
              Manage Tickets
            </button>
            <button className="admin-button">Manage Listings</button>
            <button className="admin-button">Site Settings</button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;