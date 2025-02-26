//HomePage.js

import React, { useState } from 'react';
import TopNavbar from './top_navbar'; 
import SignIn from './SignIn';
import SignUp from './SignUp';
import SideBar from './side_bar'; 
import './css/HomePage.css';

const HomePage = () => {
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);

  const handleOpenSignIn = () => setOpenSignIn(true);
  const handleCloseSignIn = () => setOpenSignIn(false);

  const handleOpenSignUp = () => setOpenSignUp(true);
  const handleCloseSignUp = () => setOpenSignUp(false);

  return (
    <div>
      <TopNavbar handleOpenSignIn={handleOpenSignIn} />
      <main className="main-content">
        <SideBar handleOpenSignIn={handleOpenSignIn} />
        <div className="image-container">
          <div className="image-box">
            <span className="image-text">Image 1</span>
          </div>
          <div className="image-box">
            <span className="image-text">Image 2</span>
          </div>
          <div className="image-box">
            <span className="image-text">Image 3</span>
          </div>
        </div>
      </main>
      <footer className="footer">
        <p className="footer-text">© 2025 AgriConnect. UwU.</p>
      </footer>
      <SignIn open={openSignIn} handleClose={handleCloseSignIn} handleOpenSignUp={handleOpenSignUp} />
      <SignUp open={openSignUp} handleClose={handleCloseSignUp} />
    </div>
  );
};

export default HomePage;
