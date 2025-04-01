import React, { useState, useEffect } from 'react';
import { User, Edit2, Camera } from 'lucide-react'; 
import './css/Profile.css';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [coverPhoto, setCoverPhoto] = useState(null); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 200) {
          setUser(response.data);
        } else {
          console.error('Failed to fetch user data:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setUploadedImage(URL.createObjectURL(file));
    } else {
      alert('Please upload a JPG or PNG image.');
    }
  };

  const handleCoverUpload = (event) => {
    const file = event.target.files[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      setCoverPhoto(URL.createObjectURL(file));
    } else {
      alert('Please upload a JPG or PNG image.');
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!user) {
    return <p>Unable to load profile information. Please try again later.</p>;
  }

  const creationDate = new Date(user.createdAt);
  const formattedDate = creationDate.toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <div className="profile-page">
      <TopNavbar />
      <main className="main-content">
        <SideBar />
        <div className="profile-page-content">
          {}
          <div className="profile-banner">
            {coverPhoto && <img src={coverPhoto} alt="Cover Photo" className="cover-photo" />}
            <label htmlFor="cover-upload" className="upload-cover-btn">
              <Camera size={24} className="camera-icon" />
              Upload Cover Photo
            </label>
            <input
              id="cover-upload"
              type="file"
              accept=".jpg,.png"
              onChange={handleCoverUpload}
              style={{ display: 'none' }}
            />
          </div>

          {}
          <div
            className="profile-icon"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {uploadedImage ? (
              <img src={uploadedImage} alt="Uploaded Profile" className="uploaded-image" />
            ) : (
              <User size={60} className="person-icon" />
            )}
            {hovered && (
              <>
                <label htmlFor="upload-input" className="edit-icon-container">
                  <Edit2 size={20} className="edit-icon" />
                </label>
                <input
                  id="upload-input"
                  type="file"
                  accept=".jpg,.png"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </>
            )}
          </div>

          {}
          <div className="profile-details">
            <h1 className="profile-name">
              {user.firstName} {user.middleName} {user.lastName}
            </h1>
            <p className="profile-date">Joined on {formattedDate}</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;