// BuyArea.js
import React, { useState, useEffect } from 'react';
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
      const response = await fetch('http://localhost:5000/api/listings', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setListings(result.listings.filter(listing => listing.status !== 'sold' && listing.stocks > 0)); // filter out sold out
      } else {
        console.error('Failed to fetch listings:', result);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchListings(); // Fetch listings on token change
    }
  }, [token]);

  const handleOpenBuyModal = (listing) => {
    setSelectedProduct(listing);
    setOpenBuyModal(true);
  };

  const handleCloseBuyModal = () => {
    setOpenBuyModal(false);
  };

  const handleAddToCart = () => {
    if (quantityToBuy < selectedProduct.minimumOrder) {
      alert('Cannot place an order as it is under the minimum order.');
      return;
    }
    if (quantityToBuy > selectedProduct.stocks) {
      alert('Cannot place an order as it exceeds the available stocks.');
      return;
    }
    alert('Product added to cart!');
    handleCloseBuyModal();
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
                  <p>Available Stocks: {listing.stocks} {listing.unit}</p>
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
                <p>Available Stocks: {selectedProduct.stocks} {selectedProduct.unit}</p>
                <p>Minimum Order: {selectedProduct.minimumOrder} {selectedProduct.unit}</p>
                <input
                  type="number"
                  min="1"
                  value={quantityToBuy}
                  onChange={(e) => setQuantityToBuy(e.target.value)}
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
