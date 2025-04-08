//CartArea.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import './css/CartArea.css';

const CartArea = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null);

  // Fetch cart items on component load
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200 && Array.isArray(response.data.cartItems)) {
          setCartItems(response.data.cartItems);
        } else {
          console.error('Failed to fetch cart items:', response.data.message);
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
        console.error('Failed to remove item:', response.data.message);
        alert('Failed to remove the item. Please try again.');
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      alert('Failed to remove the item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle quantity change
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
      } else {
        console.error('Failed to update quantity:', response.data.message);
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.productId?._id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
    }
  };

  // Handle checkbox select/deselect
  const handleCheckboxChange = (productId) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  // Toggle expanded card details
  const handleCardClick = (e, productId) => {
    
    if (e.target.closest('.cart-checkbox') || 
        e.target.closest('.quantity-control') || 
        e.target.closest('.remove-item-btn')) {
      return;
    }
    setExpandedItem(expandedItem === productId ? null : productId);
  };

  // Calculate total price (with 1% fee)
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.includes(item.productId?._id)) {
        return total + (item.productId?.price || 0) * 1.01 * item.quantity;
      }
      return total;
    }, 0);
  };

  return (
    <>
      <TopNavbar />
      <main className="main">
        <SideBar />
        <div className="main-content">
          

          <div className="cart-header">
            <h1>Your Cart</h1>
            <div className="header-divider"></div>
          </div>

          <div className="cart-container">
            {loading ? (
              <p className="loading-message">Loading cart items...</p>
            ) : cartItems.length > 0 ? (
              <>
                <table className="cart-table">
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
                            className={`cart-item-row ${isExpanded ? 'expanded' : ''}`}
                            onClick={(e) => handleCardClick(e, item.productId?._id)}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleCheckboxChange(item.productId?._id)}
                                className="cart-checkbox"
                                disabled={!item.productId}
                              />
                            </td>
                            <td>
                              <div className="product-info">
                                <div
                                  className="product-image"
                                  style={{ backgroundColor: item.productId?.color || '#ccc' }}
                                ></div>
                                <h3>{item.productId?.productName || 'Unknown Product'}</h3>
                              </div>
                            </td>
                            <td>₱{(item.productId?.price?.toFixed(2)) || '0.00'}</td>
                            <td>
                              <div className="quantity-control">
                                <button 
                                  className="quantity-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleQuantityChange(item.productId?._id, item.quantity - 1);
                                  }}
                                  disabled={item.quantity <= 1}
                                >
                                  -
                                </button>
                                <span className="quantity-value">{item.quantity}</span>
                                <button 
                                  className="quantity-btn"
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
                                className="remove-item-btn"
                                disabled={!item.productId}
                              >
                                Remove
                              </button>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="expanded-details-row">
                              <td colSpan="6">
                                <table className="expanded-details">
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
              <p className="empty-cart">Your cart is empty.</p>
            )}
            
            {/* Always show the total section, even with empty cart */}
            <div className="cart-total">
              <table className="total-table">
                <tbody>
                  <tr>
                    <td>Total Cart Price:</td>
                    <td>₱{calculateTotal().toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
              <button className="checkout-btn" disabled={selectedItems.length === 0}>
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default CartArea;