//Settings.js

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './css/Settings.css';

const Settings = () => {
  const [currentView, setCurrentView] = useState('default');
  const [isVerified, setIsVerified] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStatus, setVerificationStatus] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/user', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setIsVerified(response.data.isVerified);
          setEmail(response.data.email);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };
    fetchUserData();
  }, []);

  const handleSendVerificationEmail = async () => {
    const token = localStorage.getItem('authToken');
    setIsLoading(true);
    if (token) {
        try {
            await axios.post('http://localhost:5000/api/auth/send-verification-email', 
            { email }, 
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setEmailSent(true);
            setVerificationStatus('Verification email sent successfully.');
        } catch (error) {
            setVerificationStatus(
                `Error: ${error.response?.data?.message || 'Something went wrong'}`
            );
        }
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
  
      console.log("Verification Response:", response); 
  
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
            {emailSent && (
              <div className="status-message">{verificationStatus}</div>
            )}
            <input
              type="text"
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => { setVerificationCode(e.target.value)}}
              className="verify-input" 
            />
            <button
              onClick={handleVerifyCode}
              className="verify-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Submitting...' : 'Confirm Verification Code'}
            </button>
            {verificationStatus && (
              <div className="status-message">{verificationStatus}</div>
            )}
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
            Home
          </Link>
          <Link to="/buying" className="nav-link">
            Buying
          </Link>
          <Link to="/selling" className="nav-link">
            Selling
          </Link>
          <Link to="/chats" className="nav-link">
            Chats
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
              <Link to="#personal-details">Personal Details</Link>
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
  );
};

export default Settings;
