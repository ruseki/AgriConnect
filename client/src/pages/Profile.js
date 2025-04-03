import React, { useState, useEffect } from 'react';
import { User, ShoppingCart } from 'lucide-react';
import './css/Profile.css';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import axios from 'axios';
import { Snackbar, Alert } from '@mui/material'; 

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    birthDate: '',
    country: 'Philippines', 
    province: '',
    cityOrTown: '',
    barangay: '',
    phone: '',
    bio: '', 
  });
  const [ageWarningOpen, setAgeWarningOpen] = useState(false);
  const [ageWarningMessage, setAgeWarningMessage] = useState('');
  const [provinces, setProvinces] = useState([]); 
  const [cities, setCities] = useState([]); 
  const [barangays, setBarangays] = useState([]); 

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          const userData = response.data;
          setUser(userData);

          setFormData({
            firstName: userData.firstName || '',
            middleName: userData.middleName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            birthDate: userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : '',
            country: userData.country || 'Philippines',
            province: userData.province || '',
            cityOrTown: userData.cityOrTown || '',
            barangay: userData.barangay || '',
            phone: userData.phone || '',
            bio: userData.bio || '', 
          });
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

  useEffect(() => {
    setProvinces(['Ilocos Norte', 'Ilocos Sur', 'Pangasinan', 'La Union', 'Nueva Ecija']);
  }, []);

  useEffect(() => {
    if (formData.province === 'Ilocos Norte') {
      setCities(['Laoag', 'Batac', 'Burgos']);
    } else if (formData.province === 'Ilocos Sur') {
      setCities(['Vigan', 'Candon', 'Narvacan']);
    } else if (formData.province === 'Pangasinan') {
      setCities(['Dagupan', 'San Carlos', 'Urdaneta']);
    } else if (formData.province === 'La Union') {
      setCities(['San Fernando', 'Bauang']);
    } else if (formData.province === 'Nueva Ecija') {
      setCities(['Cabanatuan', 'Palayan']);
    } else {
      setCities([]);
    }
    setBarangays([]); 
  }, [formData.province]);

  useEffect(() => {
    if (formData.cityOrTown === 'Laoag') {
      setBarangays(['Barangay 1', 'Barangay 2', 'Barangay 3']);
    } else if (formData.cityOrTown === 'Vigan') {
      setBarangays(['Barangay A', 'Barangay B']);
    } else if (formData.cityOrTown === 'Dagupan') {
      setBarangays(['Barangay X', 'Barangay Y']);
    } else {
      setBarangays([]);
    }
  }, [formData.cityOrTown]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'birthDate') {
      const birthDate = new Date(value);
      const age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      if (age < 18) {
        setAgeWarningMessage('18 years old below are not recommended.');
        setAgeWarningOpen(true);
      } else {
        setAgeWarningOpen(false);
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const formattedFormData = {
        ...formData,
        birthDate: formData.birthDate, 
      };
      const response = await axios.put('http://localhost:5000/api/user', formattedFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        alert('Profile updated successfully!');
        setUser(response.data);
        setFormData({ ...formData, bio: response.data.bio || '' }); 
      } else {
        console.error('Failed to save profile:', response.data.message);
        alert('Failed to save profile.');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };

  const closeAgeWarning = () => {
    setAgeWarningOpen(false);
  };

  if (loading) return <p>Loading profile...</p>;
  if (!user) return <p>Unable to load profile information. Please try again later.</p>;

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
          <div className="profile-banner"></div>

          <div className="profile-icon">
            {uploadedImage ? (
              <img src={uploadedImage} alt="Uploaded Profile" className="uploaded-image" />
            ) : (
              <User size={60} className="person-icon" />
            )}
          </div>

          <div className="profile-details">
            <div className="editable-name">
              <div className="input-label">First Name</div>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                className="profile-input"
              />
              <div className="input-label">Middle Name</div>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
                placeholder="Middle Name"
                className="profile-input"
              />
              <div className="input-label">Last Name</div>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                className="profile-input"
              />
            </div>

            <p className="profile-date">Joined on {formattedDate}</p>

            <div className="profile-info">
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="profile-input"
              />

              <label>Birth Date:</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleInputChange}
                className="profile-input"
              />

              <label>Country:</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                readOnly
                className="profile-input"
              />

              <label>Province:</label>
              <select
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                className="profile-select"
              >
                <option value="">Select Province</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>

              <label>City/Town:</label>
              <select
                name="cityOrTown"
                value={formData.cityOrTown}
                onChange={handleInputChange}
                className="profile-select"
              >
                <option value="">Select City/Town</option>
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <label>Barangay:</label>
              <select
                name="barangay"
                value={formData.barangay}
                onChange={handleInputChange}
                className="profile-select"
              >
                <option value="">Select Barangay</option>
                {barangays.map((barangay) => (
                  <option key={barangay} value={barangay}>{barangay}</option>
                ))}
              </select>

              <label>Phone Number:</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                placeholder="Currently not supported"
                className="profile-input"
              />

              <label>Bio:</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="profile-textarea"
              />
            </div>

            <div className="profile-buttons">
              <button className="save-profile-btn" onClick={handleSaveProfile}>
                Save
              </button>
            </div>
          </div>

          {/* Popup for age warning */}
          <Snackbar
            open={ageWarningOpen}
            autoHideDuration={4000}
            onClose={closeAgeWarning}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={closeAgeWarning} severity="warning" sx={{ width: '100%' }}>
              {ageWarningMessage}
            </Alert>
          </Snackbar>
        </div>
      </main>
    </div>
  );
};

export default Profile;