/* ViewProfile.js */

import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react'; 
import axios from 'axios';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import './css/ViewProfile.css';
import { useParams } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';

const ViewProfile = () => {
  const { userId } = useParams(); 
  console.log('userId from useParams:', userId); 
  const { token } = useAuth(); 
  const [userData, setUserData] = useState(null); 
  const [listings, setListings] = useState([]); 
  const [coverColor, setCoverColor] = useState(''); 

  useEffect(() => {
    const colors = ['#F0A500', '#4CAF50', '#FF4081', '#2196F3', '#9C27B0'];
    setCoverColor(colors[Math.floor(Math.random() * colors.length)]);

    const fetchUserData = async () => {
      try {
        const API_BASE_URL = "https://backend-service-538405936687.us-central1.run.app";

        const response = await axios.get(`${API_BASE_URL}/api/users/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } } 
        );

        if (response.status === 200) {
          setUserData(response.data.user); 
        } else {
          console.error('Failed to fetch user data:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      }
    };

    const fetchUserListings = async () => {
      try {
        const API_BASE_URL = "https://backend-service-538405936687.us-central1.run.app";

        const response = await axios.get(`${API_BASE_URL}/api/listings/user/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } } 
        );

        if (response.status === 200) {
          setListings(response.data.listings); 
        } else {
          console.error('Failed to fetch user listings:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching user listings:', error.message);
      }
    };

    fetchUserData();
    fetchUserListings();
  }, [userId, token]); 

  return (
    <>
      <TopNavbar />
      <main className="viewprofile-main">
        <SideBar />
        <div className="viewprofile-main-content">
          {userData && (
            <>
              {}
              <div className="viewprofile-cover-photo" style={{ backgroundColor: coverColor }}>
                <div className="viewprofile-user-icon-container">
                  <User size={60} className="viewprofile-user-icon" />
                </div>
              </div>

              {}
              <div className="viewprofile-user-info-section">
                <h1 className="viewprofile-user-name">
                  {userData.first_name} {userData.last_name}
                </h1>
                <p className="viewprofile-account-created">
                  Account Created: {new Date(userData.createdAt).toLocaleString()}
                </p>
                {userData.bio && <p className="viewprofile-bio">{userData.bio}</p>}
              </div>
            </>
          )}

          {}
          <div className="viewprofile-listings-section">
            <h2>Available Listings</h2>
            <div className="viewprofile-listings-container">
              {listings.length > 0 ? (
                listings.map((listing) => (
                  <div key={listing._id} className="viewprofile-listing-card">
                    <div
                      className="viewprofile-image-placeholder"
                      style={{ backgroundColor: listing.color || '#f1f1f1' }}
                    ></div>
                    <h3>{listing.productName}</h3>
                    <p>Category: {listing.category}</p>
                    <p>Price: ₱{listing.price}</p>
                    <p>Available Stocks: {listing.quantity} {listing.unit}</p>
                  </div>
                ))
              ) : (
                <p>No listings available.</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ViewProfile;