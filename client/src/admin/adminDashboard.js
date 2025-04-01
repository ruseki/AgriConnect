import React, { useEffect } from 'react';
import './css/adminDashboard.css';
import SideBar from '../components/side_bar';
import TopNavbar from '../components/top_navbar';
import axios from 'axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userFromLocalStorage = JSON.parse(localStorage.getItem('user'));

    if (!userFromLocalStorage || !userFromLocalStorage.isAdmin) {
      console.error('User is not an admin based on localStorage. Redirecting to homepage.');
      navigate('/');
      return;
    }

    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` },
        });

        const user = response.data;

        if (!user.isAdmin) {
          console.error('User is not an admin based on API response. Redirecting to homepage.');
          navigate('/');
        } else {
          console.log('Admin access granted.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/');
      }
    };

    fetchUser();
  }, [navigate]);

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
            <p>Admin privileges confirmed. Welcome!</p>
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

          {}
          <div className="admin-sections">
            <button
              className="admin-button"
              onClick={() => navigate('/manage-users')}
            >
              Manage Users
            </button>
            <button
              className="admin-button"
              onClick={() => navigate('/manage-tickets')}
            >
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