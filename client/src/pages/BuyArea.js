import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import { useAuth } from '../components/AuthProvider';
import './css/BuyArea.css';

const BuyArea = () => {
  const { token, userId } = useAuth(); 
  const [listings, setListings] = useState([]);
  const [openBuyModal, setOpenBuyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartQuantity, setCartQuantity] = useState(1); 

  const fetchListings = async () => {
    try {
      console.log('Fetching listings with token:', token);

      const response = await axios.get('http://localhost:5000/api/listings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setListings(response.data.listings.filter((listing) => listing.status === true && listing.quantity > 0));
        console.log('Fetched listings:', response.data.listings);
      } else {
        console.error('Failed to fetch listings:', response.data.message);
      }
    } catch (error) {
      console.error('Error fetching listings:', error.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchListings();
    }
  }, [token]);

  const handleOpenBuyModal = (listing) => {
    setSelectedProduct(listing);
    setCartQuantity(listing.minimumOrder || 1); 
    setOpenBuyModal(true);
  };

  const handleCloseBuyModal = () => {
    setSelectedProduct(null);
    setOpenBuyModal(false);
  };

  const handleAddToCart = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/cart/add',
        {
          productId: selectedProduct._id,
          quantity: cartQuantity,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert('Item added to cart successfully!');
        handleCloseBuyModal();
      } else {
        console.error('Failed to add to cart:', response.data.message);
      }
    } catch (error) {
      console.error('Error adding to cart:', error.message);
      alert('Failed to add item to cart.');
    }
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
                <p className="seller-info">
                  <span className="seller-icon">S</span> {selectedProduct.seller || 'Unknown'}
                </p>
                <p><strong>Price:</strong> ₱{selectedProduct.price}</p>
                <p><strong>Available Stocks:</strong> {selectedProduct.quantity} {selectedProduct.unit}</p>
                <p><strong>Minimum Order:</strong> {selectedProduct.minimumOrder} {selectedProduct.unit}</p>
                <p><strong>Description:</strong> {selectedProduct.description}</p>
                <p><strong>Listed on:</strong> {selectedProduct.listedDate || 'N/A'}</p>

                {}
                {selectedProduct.userId !== userId && (
                  <div className="add-to-cart-container">
                    <h3 className="add-to-cart-title">Add to Cart</h3>
                    <p>How many would you like to add to your cart?</p>
                    <div className="quantity-selector">
                      <button
                        onClick={() =>
                          setCartQuantity((prev) =>
                            Math.max(selectedProduct.minimumOrder || 1, prev - 1)
                          )
                        }
                        className="quantity-btn"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={cartQuantity}
                        onChange={(e) =>
                          setCartQuantity(Math.max(selectedProduct.minimumOrder || 1, Number(e.target.value)))
                        }
                        className="quantity-input"
                      />
                      <button
                        onClick={() => setCartQuantity((prev) => prev + 1)}
                        className="quantity-btn"
                      >
                        +
                      </button>
                    </div>
                    <button className="buy-now-btn" onClick={handleAddToCart}>
                      Add to Cart
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default BuyArea;