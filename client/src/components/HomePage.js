// HomePage.js

import React, { useState } from 'react';
import TopNavbar from './top_navbar';
import SignIn from './SignIn';
import SignUp from './SignUp';
import SideBar from './side_bar';
import Chatbox from './Chatbox'; 
import './css/HomePage.css';
// pwede to kahit sa css na mismo nasa HomePage.css, no need import, lagay mo lang sa assets folder natin tas tawagin mo lang sa css file nya

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
      <SignIn open={openSignIn} handleClose={handleCloseSignIn} handleOpenSignUp={handleOpenSignUp} />
      <SignUp open={openSignUp} handleClose={handleCloseSignUp} />
      <Chatbox />
    </div>
  );
};

export default HomePage;
