import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import { useAuth } from '../components/AuthProvider';
import './css/BuyArea.css';

const BuyArea = () => {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [openBuyModal, setOpenBuyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchListings = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/listings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setListings(response.data.listings.filter((listing) => listing.status !== 'sold'));
      } else {
        console.error('Failed to fetch listings:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchListings();
    }
  }, [token]);

  const handleOpenBuyModal = (listing) => {
    setSelectedProduct(listing);
    setOpenBuyModal(true);
  };

  const handleCloseBuyModal = () => {
    setSelectedProduct(null);
    setOpenBuyModal(false);
  };

  const handleBuyNow = () => {
    alert(`Buying ${selectedProduct?.productName}! Implement real buying logic here.`);
  };

  return (
    <>
      <TopNavbar />
      <main className="main">
        <SideBar />
        <div className="main-content">
          <div className="listings-container">
            {listings.length > 0 ? (
              listings.map((listing) => (
                <div
                  key={listing._id}
                  className="listing-card"
                  onClick={() => handleOpenBuyModal(listing)} 
                >
                  {}
                  <div
                    className="image-placeholder"
                    style={{ backgroundColor: listing.color || '#f1f1f1' }}
                  ></div>
                  <h3>{listing.productName}</h3>
                  <p>Category: {listing.category}</p>
                  <p>Price: ₱{listing.price}</p>
                  <p>Available Stocks: {listing.quantity} {listing.unit}</p>
                </div>
              ))
            ) : (
              <p>No products available.</p>
            )}
          </div>

          {openBuyModal && selectedProduct && (
            <div className="modal">
              <div className="modal-overlay" onClick={handleCloseBuyModal}></div>
              <div className="modal-content">
                <button className="close-modal-btn" onClick={handleCloseBuyModal}>
                  &times;
                </button>
                <div
                  className="image-placeholder-modal"
                  style={{ backgroundColor: selectedProduct.color || '#f1f1f1' }}
                ></div>
                <h2>{selectedProduct.productName}</h2>
                <p><strong>Seller:</strong> {selectedProduct.seller || 'Unknown'}</p>
                <p><strong>Listed on:</strong> {selectedProduct.listedDate || 'N/A'}</p>
                <p><strong>Category:</strong> {selectedProduct.category}</p>
                <p><strong>Price:</strong> ₱{selectedProduct.price}</p>
                <p><strong>Available Stocks:</strong> {selectedProduct.quantity} {selectedProduct.unit}</p>
                <p><strong>Minimum Order:</strong> {selectedProduct.minimumOrder} {selectedProduct.unit}</p>
                <p><strong>Description:</strong> {selectedProduct.description || 'No description available.'}</p>
                <button className="buy-now-btn" onClick={handleBuyNow}>
                  Buy Now
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default BuyArea;
