// CartArea.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import './css/CartArea.css';
import { Link } from 'react-router-dom';

const CartArea = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200 && Array.isArray(response.data.cartItems)) {
          setCartItems(response.data.cartItems);
          console.log('Fetched cart items:', response.data.cartItems.map(item => ({
            id: item.productId?._id,
            name: item.productId?.productName,
            quantity: item.quantity,
            price: item.productId?.price,
            isValid: item.quantity > 0 && item.productId?.price > 0
          })));
        } else {
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleRemoveItem = async (productId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:5000/api/cart/remove',
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        const updatedCart = cartItems.filter(item => item.productId?._id !== productId);
        setCartItems(updatedCart);
        setSelectedItems((prevSelected) => prevSelected.filter((id) => id !== productId));
        if (expandedItem === productId) setExpandedItem(null);
      } else {
        alert('Failed to remove the item. Please try again.');
      }
    } catch (error) {
      alert('Failed to remove the item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:5000/api/cart/update',
        { productId, quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.productId?._id === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    } catch (error) {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.productId?._id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const handleCheckboxChange = (productId) => {
    setSelectedItems((prevSelected) => {
      const isSelected = prevSelected.includes(productId);
      return isSelected
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId];
    });
  };

  const handleCardClick = (e, productId) => {
    if (
      e.target.closest('.cartarea-checkbox') ||
      e.target.closest('.cartarea-quantity-control') ||
      e.target.closest('.cartarea-remove-btn')
    ) {
      return;
    }
    setExpandedItem(expandedItem === productId ? null : productId);
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.includes(item.productId?._id)) {
        const itemTotal = (item.productId?.price || 0) * 1.01 * item.quantity;
        return total + itemTotal;
      }
      return total;
    }, 0);
  };

  const [openPaymentModal, setOpenPaymentModal] = useState(false); // Tracks modal visibility
  const [bank, setBank] = useState(''); // Captures bank input
  const [refNo, setRefNo] = useState(''); // Captures reference number input
  const [uploadedImage, setUploadedImage] = useState(null); // Captures uploaded image

  const handleOpenPaymentModal = () => {
    setOpenPaymentModal(true);
  };
  
  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setBank('');
    setRefNo('');
    setUploadedImage(null);
  };
  
  const handleSavePayment = async () => {
    try {
      const token = localStorage.getItem('authToken');
  
      if (selectedItems.length === 0) {
        alert('Please select at least one item to proceed with payment');
        return;
      }
  
      if (!uploadedImage) {
        alert('Please upload a proof of payment image');
        return;
      }
  
      let successCount = 0;
      let failCount = 0;
  
      // Process each selected item as an individual checkout
      for (const listingId of selectedItems) {
        const item = cartItems.find((cartItem) => cartItem.productId?._id === listingId);
        
        // Validate item data
        if (!item) {
          console.error(`Item not found in cart: ${listingId}`);
          failCount++;
          continue;
        }

        if (!item.quantity || item.quantity <= 0) {
          console.error(`Invalid quantity for item ${listingId}:`, item.quantity);
          failCount++;
          continue;
        }

        if (!item.productId?.price || item.productId.price <= 0) {
          console.error(`Invalid price for item ${listingId}:`, item.productId?.price);
          failCount++;
          continue;
        }

        console.log('Submitting checkout:', {
          listingId,
          quantity: item.quantity,
          price: item.productId.price,
          totalPrice: item.productId.price * 1.01 * item.quantity
        });

        const formData = new FormData();
        formData.append('bank', bank);
        formData.append('referenceNumber', refNo);
        formData.append('listingId', listingId);
        formData.append('proofImage', uploadedImage);
        formData.append('quantity', item.quantity);
        formData.append('price', item.productId.price); // Explicitly include price
  
        try {
          const response = await axios.post('http://localhost:5000/api/cart/submit', formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          });
  
          if (response.status === 201) {
            successCount++;
          }
        } catch (error) {
          console.error(`Error processing checkout for item ${listingId}:`, error);
          failCount++;
        }
      }
  
      if (successCount > 0) {
        alert(`Successfully submitted ${successCount} checkout(s). Failed: ${failCount}`);
        for (const listingId of selectedItems) {
          await handleRemoveItem(listingId); // Remove items from the cart after successful checkout
        }
        setSelectedItems([]);
        handleClosePaymentModal();
      } else {
        alert('Failed to submit any checkouts. Please try again.');
      }
    } catch (error) {
      console.error('Error in payment submission:', error.message);
      alert('Failed to process payment. Please try again.');
    }
  };
  
  return (
    <>
      <TopNavbar />
      <main className="cartarea-main">
        <SideBar />
        <div className="cartarea-main-content">

<div className="cartarea-navigation">
  <Link to="/cart" className="cartarea-nav-link active">My Cart</Link>
  <Link to="/pending" className="cartarea-nav-link">Pending</Link>
  <Link to="/orders" className="cartarea-nav-link">Orders</Link>
  <Link to="/successful" className="cartarea-nav-link">Successful Orders</Link>
</div>

          <div className="cartarea-container">
            {loading ? (
              <p className="cartarea-loading-message">Loading cart items...</p>
            ) : cartItems.length > 0 ? (
              <>
                <table className="cartarea-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => {
                      const priceWithFee = (item.productId?.price || 0) * 1.01;
                      const isExpanded = expandedItem === item.productId?._id;
                      const isSelected = selectedItems.includes(item.productId?._id);

                      return (
                        <React.Fragment key={item.productId?._id || Math.random()}>
                          <tr
                            className={`cartarea-item-row ${isExpanded ? 'expanded' : ''}`}
                            onClick={(e) => handleCardClick(e, item.productId?._id)}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleCheckboxChange(item.productId?._id || null)}
                                className="cartarea-checkbox"
                                disabled={!item.productId}
                              />
                            </td>
                            <td>
                              <div className="cartarea-product-info">
                                <div
                                  className="cartarea-product-image"
                                  style={{ backgroundColor: item.productId?.color || '#ccc' }}
                                ></div>
                                <h3>{item.productId ? item.productId.productName : 'Deleted Product'}</h3>
                              </div>
                            </td>
                            <td>₱{(item.productId?.price?.toFixed(2)) || '0.00'}</td>
                            <td>
                              <div className="cartarea-quantity-control">
                                <button
                                  className="cartarea-quantity-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(item.productId?._id, item.quantity - 1);
                                  }}
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="cartarea-quantity-value">{item.quantity}</span>
                                <button
                                  className="cartarea-quantity-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(item.productId?._id, item.quantity + 1);
                                  }}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                            <td>₱{(priceWithFee * item.quantity).toFixed(2)}</td>
                            <td>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveItem(item.productId?._id);
                                }}
                                className="cartarea-remove-btn"
                                disabled={!item.productId}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="cartarea-expanded-details-row">
                              <td colSpan="6">
                                <table className="cartarea-expanded-details">
                                  <tbody>
                                    <tr>
                                      <td>Product Price:</td>
                                      <td>₱{(item.productId?.price?.toFixed(2)) || '0.00'}</td>
                                    </tr>
                                    <tr>
                                      <td>Commission Fee (1%):</td>
                                      <td>₱{((item.productId?.price || 0) * 0.01).toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                      <td>Total Price (with Fee):</td>
                                      <td>₱{(priceWithFee * item.quantity).toFixed(2)}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </>
            ) : (
              <p className="cartarea-empty-message">Your cart is empty.</p>
            )}

            <div className="cartarea-total">
              <table className="cartarea-total-table">
                <tbody>
                  <tr>
                    <td>Total Cart Price:</td>
                    <td>₱{calculateTotal().toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <button
                className="cartarea-checkout-btn"
                disabled={selectedItems.length === 0}
                onClick={handleOpenPaymentModal}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {openPaymentModal && (
        <div className="cartarea-payment-modal-overlay">
          <div className="cartarea-payment-modal-content">
            <button className="cartarea-payment-modal-close-btn" onClick={handleClosePaymentModal}>
              &times;
            </button>
            <h2 className="cartarea-payment-modal-title">Enter Proof of Payment</h2>
            <img
              src="/payment_qrcode.png"
              alt="Payment QR Code"
              className="cartarea-payment-modal-image"
            />
            <div className="cartarea-payment-modal-inputs">
              <input
                type="text"
                placeholder="BANK"
                value={bank}
                onChange={(e) => setBank(e.target.value)}
                className="cartarea-payment-modal-bank-input"
              />
              <input
                type="text"
                placeholder="REFERENCE NO."
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                className="cartarea-payment-modal-ref-input"
              />
            </div>
            <div className="cartarea-payment-modal-upload">
              <label htmlFor="cartarea-payment-modal-file-upload" className="cartarea-payment-modal-upload-label">
                Upload an image (optional)
              </label>
              <input
                type="file"
                id="cartarea-payment-modal-file-upload"
                className="cartarea-payment-modal-file-upload"
                onChange={(e) => setUploadedImage(e.target.files[0])}
              />
            </div>
            <button className="cartarea-payment-modal-save-btn" onClick={handleSavePayment}>
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CartArea;