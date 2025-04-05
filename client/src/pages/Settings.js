import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom';
import axios from 'axios';
import './css/Settings.css';
import { useAuth } from '../components/AuthProvider'

const Settings = () => {
  const { token, isAuthenticated, logout } = useAuth();
  const [currentView, setCurrentView] = useState('default');
  const [isVerified, setIsVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [personalDetails, setPersonalDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    about: '',
    phoneNumber: '',
  });

  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/'); // Redirect to login page if not authenticated
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/user', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          console.log('User data response:', response.data);

          // Set user data from response
          setIsVerified(response.data.isVerified);
          setEmail(response.data.email);
          setPersonalDetails({
            firstName: response.data.first_name || '',
            lastName: response.data.last_name || '',
            email: response.data.email || '',
            phoneNumber: response.data.phoneNumber || '09123',
            about: response.data.bio || 'Biot'
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          
          // Handle token expiration or authentication errors
          if (error.response?.status === 401) {
            alert('Your session has expired. Please log in again.');
            logout(); // Call logout from your auth context
            navigate('/login');
          }
        }
      }
    };
    
    fetchUserData();
  }, [token, logout, navigate]);

  const handlePersonalDetailsChange = (e) => {
    const { name, value } = e.target;
    setPersonalDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSavePersonalDetails = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await axios.put('http://localhost:5000/api/auth/update-profile', personalDetails, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert('Profile updated successfully!'); // Success message
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile.');
      }
    }
  };

  const handleSendVerificationEmail = async () => {
    const token = localStorage.getItem('authToken');
    setIsLoading(true);
    if (token && email) { // Added check for email
      try {
        const response = await axios.post(
          'http://localhost:5000/api/auth/send-verification-email',
          { email },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Verification email sent:', response.data);
        setEmailSent(true);
        setVerificationStatus('Verification email sent successfully.');
      } catch (error) {
        console.error('Error sending verification email:', error);
        setVerificationStatus(
          `Error: ${error.response?.data?.message || 'Something went wrong'}`
        );
      }
    } else {
      setVerificationStatus('Error: Email is missing. Please refresh and try again.');
    }
    setIsLoading(false);
  };
  const handleVerifyCode = async () => {
    setIsLoading(true);

    try {
      console.log('Sending Verification:', { email, token: verificationCode });

      const response = await axios.post('http://localhost:5000/api/auth/verify-email', {
        email,
        token: verificationCode,
      });

      console.log('Verification Response:', response);

      if (response.status === 200) {
        setVerificationStatus(response.data.message);
        setIsVerified(true);
      } else {
        setVerificationStatus('Error verifying email.');
      }
    } catch (error) {
      console.error('Error during verification:', error.response?.data?.message || error.message);

      setVerificationStatus(
        `Error: ${error.response?.data?.message || 'Something went wrong'}`
      );
    }

    setIsLoading(false);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'verifyEmail':
        return (
          <div className="verify-email-content">
            <button
              onClick={handleSendVerificationEmail}
              className="verify-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Verification Email'}
            </button>
            {emailSent && <div className="status-message">{verificationStatus}</div>}
            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value);
              }}
              className="verify-input"
            />
            <button
              onClick={handleVerifyCode}
              className="verify-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Confirm Verification Code'}
            </button>
            {verificationStatus && <div className="status-message">{verificationStatus}</div>}
          </div>
        );
      case 'personal-details':
        return (
          <div className="personal-details-content">
            <h1>Personal Information</h1>

            <div className="section">
              <h2>Profile</h2>

              <div className="form-group">
                <label>First name</label>
                <input
                  type="text"
                  name="firstName"
                  value={personalDetails.firstName}
                  onChange={handlePersonalDetailsChange}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Last name</label>
                <input
                  type="text"
                  name="lastName"
                  value={personalDetails.lastName}
                  onChange={handlePersonalDetailsChange}
                  className="form-input"
                />
              </div>

              <div className="divider"></div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={personalDetails.email}
                  onChange={handlePersonalDetailsChange}
                  className="form-input"
                />
              </div>

              <div className="divider"></div>

              <div className="form-group">
                <label>Phone number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={personalDetails.phoneNumber}
                  onChange={handlePersonalDetailsChange}
                  className="form-input"
                />
              </div>

              <div className="divider"></div>

              <div className="form-group">
                <label>About</label>
                <textarea
                  name="about"
                  value={personalDetails.about}
                  onChange={handlePersonalDetailsChange}
                  className="form-textarea"
                  placeholder="Brief description for your profile."
                />
              </div>
            </div>

            <button onClick={handleSavePersonalDetails} className="save-btn">
              Save Changes
            </button>
          </div>
        );
      default:
        return (
          <div className="default-content">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Search the settings"
              className="search-input"
            />
          </div>
        );
    }
  };

  return (
    <div className="settings">
      <div className="settings-page">
        <nav className="settings-nav">
          <div className="nav-left">
            <Link to="/" className="nav-logo">
              AgriConnect
            </Link>
            <div className="nav-search">
              <input
                type="text"
                placeholder="Search in AgriConnect..."
                className="search-input"
              />
            </div>
          </div>
          <div className="nav-right">
            <Link to="/" className="nav-link">
              <i className="fas fa-home"></i> Home
            </Link>
            <Link to="/buying" className="nav-link">
              <i className="fas fa-shopping-bag"></i> Buying
            </Link>
            <Link to="/selling" className="nav-link">
              <i className="fas fa-store"></i> Selling
            </Link>
            <Link to="/chats" className="nav-link">
              <i className="fas fa-comments"></i> Chats
            </Link>
            <button>
              <i className="fas fa-shopping-cart"></i>
            </button>
            <button>
              <i className="fas fa-bell"></i>
            </button>
            <button>
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </nav>
        <div className="settings-content">
          <aside className="settings-sidebar">
            <h2>Settings</h2>
            <ul>
              <li>
                <button
                  onClick={() => setCurrentView('personal-details')}
                  className="settings-link"
                >
                  Personal Details
                </button>
              </li>
              <li>
                <Link to="#password-security">Password and Security</Link>
              </li>
              {!isVerified && (
                <li>
                  <button
                    onClick={() => setCurrentView('verifyEmail')}
                    className="verify-email-btn"
                  >
                    Verify Email
                  </button>
                </li>
              )}
              <li>
                <Link to="#accessibility">Accessibility</Link>
              </li>
              <li>
                <label className="theme-label">
                  Dark Theme
                  <input type="checkbox" className="theme-checkbox" />
                </label>
              </li>
              <li>
                <Link to="#change-language">Change Language</Link>
              </li>
              <li>
                <Link to="#privacy">Privacy</Link>
              </li>
              <li>
                <label className="documents-label">
                  Show Seller Government Documents
                  <input type="checkbox" className="documents-checkbox" />
                </label>
              </li>
              <li>
                <Link to="#activity-log">Activity Log</Link>
              </li>
            </ul>
          </aside>
          <main className="settings-main-content">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
};

export default Settings;