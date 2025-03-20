// BuyArea.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import { useAuth } from '../components/AuthProvider';
import './css/BuyArea.css';

const BuyArea = () => {
  const { isAuthenticated, token } = useAuth();
  const [listings, setListings] = useState([]);
  const [openBuyModal, setOpenBuyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantityToBuy, setQuantityToBuy] = useState(1);

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
    setOpenBuyModal(false);
    setQuantityToBuy(1);
  };

  const handleAddToCart = async () => {
    if (quantityToBuy < selectedProduct.minimumOrder) {
      alert('Cannot place an order as it is under the minimum order.');
      return;
    }

    if (quantityToBuy > selectedProduct.quantity) {
      alert('Cannot place an order as it exceeds the available stocks.');
      return;
    }

    try {
      const response = await axios.post(
        'http://localhost:5000/api/cart/add',
        { productId: selectedProduct._id, quantity: quantityToBuy },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        alert('Product added to cart!');
        handleCloseBuyModal();
      } else {
        console.error('Failed to add product to cart:', response.data.message);
      }
    } catch (error) {
      console.error('Error adding product to cart:', error);
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
                <div key={listing._id} className="listing-card">
                  <h3>{listing.productName}</h3>
                  <p>Category: {listing.category}</p>
                  <p>Price: ₱{listing.price}</p>
                  <p>Available Stocks: {listing.quantity} {listing.unit}</p>
                  <button onClick={() => handleOpenBuyModal(listing)} className="buy-now-btn">
                    Buy Now
                  </button>
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
                <h2>{selectedProduct.productName}</h2>
                <p>Price: ₱{selectedProduct.price}</p>
                <p>Available Stocks: {selectedProduct.quantity} {selectedProduct.unit}</p>
                <p>Minimum Order: {selectedProduct.minimumOrder} {selectedProduct.unit}</p>
                <input
                  type="number"
                  min="1"
                  value={quantityToBuy}
                  onChange={(e) => setQuantityToBuy(Number(e.target.value))}
                  className="quantity-input"
                />
                <button onClick={handleAddToCart} className="add-to-cart-btn">
                  Add to Cart
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
