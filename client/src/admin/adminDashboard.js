import React, { useEffect, useState } from 'react';
import './css/adminDashboard.css';
import SideBar from '../components/side_bar';
import TopNavbar from '../components/top_navbar';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const validateAdminAccess = async () => {
      const userFromStorage = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('authToken');

      if (!userFromStorage || !token) {
        console.error('Missing user or token in localStorage.');
        navigate('/');
        return;
      }

      if (!userFromStorage.isAdmin) {
        console.warn('User is not an admin.');
        navigate('/');
        return;
      }

      try {
        const API_BASE_URL = "https://backend-service-538405936687.us-central1.run.app";

        const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    validateAdminAccess();
  }, [navigate]);

  const totalUsers = users.length;
  const onlineUsers = users.filter(user => user.isOnline).length;
  const verifiedSellers = users.filter(user => user.isSeller && user.isVerified).length;

  const maxUsers = 200; 
  const totalUsersPercent = Math.round((totalUsers / maxUsers) * 100);
  const onlineUsersPercent = totalUsers ? Math.round((onlineUsers / totalUsers) * 100) : 0;
  const verifiedSellersPercent = totalUsers ? Math.round((verifiedSellers / totalUsers) * 100) : 0;

  if (loading) {
    return <div className="admin-dashboard-loading">Loading...</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <TopNavbar />
      <div className="dashboard-content">
        <SideBar />
        <div className="dashboard-main">
          <div className="admin-dashboard">
            <h1>Admin Panel</h1>
          </div>

          {/* Statistics Section */}
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

          <div className="admin-sections">
            <button className="admin-button" onClick={() => navigate('/manage-users')}>
              Manage Users
            </button>

            <button className="admin-button" onClick={() => navigate('/manage-users-checkouts')}>
              Manage User Checkouts
            </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
