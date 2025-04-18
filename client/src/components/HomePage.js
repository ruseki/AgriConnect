import React, { useState } from 'react';
import TopNavbar from './top_navbar';
import SignIn from './SignIn';
import SignUp from './SignUp';
import SideBar from './side_bar';
import Chatbox from './Chatbox';
import './css/HomePage.css';

const HomePage = () => {
  const [openSignIn, setOpenSignIn] = useState(false);
  const [openSignUp, setOpenSignUp] = useState(false);

  const handleOpenSignIn = () => setOpenSignIn(true);
  const handleCloseSignIn = () => setOpenSignIn(false);

  const handleOpenSignUp = () => setOpenSignUp(true);
  const handleCloseSignUp = () => setOpenSignUp(false);

  const imageData = [
    {
      id: 1,
      title: "Banana",
      url: "https://nutritionsource.hsph.harvard.edu/wp-content/uploads/2018/08/bananas-1354785_1920.jpg", // Replace with your actual URL
      imageUrl: "https://nutritionsource.hsph.harvard.edu/wp-content/uploads/2018/08/bananas-1354785_1920.jpg"
    },
    {
      id: 2,
      title: "Strawberry",
      url: "https://cdn.britannica.com/22/75922-050-D3982BD0/flowers-fruits-garden-strawberry-plant-species.jpg", // Replace with your actual URL
      imageUrl: "https://cdn.britannica.com/22/75922-050-D3982BD0/flowers-fruits-garden-strawberry-plant-species.jpg"
    },
    {
      id: 3,
      title: "Mango",
      url: "https://www.organics.ph/cdn/shop/products/mango-ripe-250grams-per-piece-fruits-vegetables-fresh-produce-979218.jpg?v=1601479990", // Replace with your actual URL
      imageUrl: "https://www.organics.ph/cdn/shop/products/mango-ripe-250grams-per-piece-fruits-vegetables-fresh-produce-979218.jpg?v=1601479990"
    },
  
    {
      id: 4,
      title: "Kabalasa",
      url: "https://palengkego.shop/cdn/shop/products/desi-ppp.jpg?v=1627817750", 
      imageUrl: "https://palengkego.shop/cdn/shop/products/desi-ppp.jpg?v=1627817750"
    },
    {
      id: 5,
      title: "Sitaw",
      url: "https://b2557954.smushcdn.com/2557954/wp-content/uploads/2014/04/20140331_092245_resized.jpg?lossy=0&strip=1&webp=1", 
      imageUrl: "https://b2557954.smushcdn.com/2557954/wp-content/uploads/2014/04/20140331_092245_resized.jpg?lossy=0&strip=1&webp=1"
    },
    {
      id: 6,
      title: "Pechay",
      url: "https://greengarden.ph/cdn/shop/products/LINE_ALBUM_PICTURE_230412_98.jpg?v=1681289928", 
      imageUrl: "https://greengarden.ph/cdn/shop/products/LINE_ALBUM_PICTURE_230412_98.jpg?v=1681289928"
    },
    {
      id: 7,
      title: "Repolyo",
      url: "https://thehouseofgoodies.com/cdn/shop/products/repolyo.jpg?v=1602168415", 
      imageUrl: "https://thehouseofgoodies.com/cdn/shop/products/repolyo.jpg?v=1602168415"
    },
    {
      id: 8,
      title: "Talong",
      url: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjO4LtM9e7yXEeFSWiusCj-EqyRxuJvcrzm238SYnW5CBqAU4ul8d95J-cjxadMKQcSsaxYa2Jgyb-DjR0oqTe-XesnQju0U-QgGQiiMhDslPK_ep8SwPywXi6whSXiePBQtCfp5iqhgFYw/s690/1.+Juan+magsasaka+talong+guide.jpg", 
      imageUrl: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjO4LtM9e7yXEeFSWiusCj-EqyRxuJvcrzm238SYnW5CBqAU4ul8d95J-cjxadMKQcSsaxYa2Jgyb-DjR0oqTe-XesnQju0U-QgGQiiMhDslPK_ep8SwPywXi6whSXiePBQtCfp5iqhgFYw/s690/1.+Juan+magsasaka+talong+guide.jpg"
    },
  ];

  return (
    <div>
      <TopNavbar handleOpenSignIn={handleOpenSignIn} />
      <main className="main-content">
        <SideBar handleOpenSignIn={handleOpenSignIn} />
        <div className="image-container">
          {imageData.map((image) => (
            <a 
              key={image.id} 
              href={image.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="image-link"
            >
              <div 
                className="image-box"
                style={{ backgroundImage: `url(${image.imageUrl})` }}
              >
                <span className="image-text">{image.title}</span>
              </div>
            </a>
          ))}
        </div>
      </main>
      <SignIn open={openSignIn} handleClose={handleCloseSignIn} handleOpenSignUp={handleOpenSignUp} />
      <SignUp open={openSignUp} handleClose={handleCloseSignUp} />
      <Chatbox />
    </div>
  );
};

export default HomePage;