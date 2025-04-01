import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import './css/CartArea.css';

const CartArea = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [expandedItem, setExpandedItem] = useState(null); // Track expanded product cards

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200) {
          setCartItems(response.data.cartItems); // Assuming populated data
        } else {
          console.error('Failed to fetch cart items:', response.data.message);
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleRemoveItem = async (productId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:5000/api/cart/remove',
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        setCartItems(response.data.cartItems);
        setSelectedItems(selectedItems.filter((id) => id !== productId));
        alert('Item removed from cart!');
      } else {
        console.error('Failed to remove item:', response.data.message);
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const handleCheckboxChange = (productId) => {
    if (selectedItems.includes(productId)) {
      setSelectedItems(selectedItems.filter((id) => id !== productId));
    } else {
      setSelectedItems([...selectedItems, productId]);
    }
  };

  const handleCardClick = (e, productId) => {
    if (e.target.closest('.cart-checkbox')) return;

    if (expandedItem === productId) {
      setExpandedItem(null);
    } else {
      setExpandedItem(productId);
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      if (item.productId && selectedItems.includes(item.productId._id)) {
        const priceWithFee = item.productId.price * 1.01; // 1% commission fee
        return total + priceWithFee * item.quantity;
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
          <h1>Your Cart</h1>
          {loading ? (
            <p>Loading cart items...</p>
          ) : cartItems.length > 0 ? (
            <div className="cart-container">
              {cartItems.map((item) => {
                if (!item.productId) {
                  console.warn('Invalid item in cart:', item);
                  return null; 
                }

                const priceWithFee = item.productId.price * 1.01; // 1% commission fee
                const isExpanded = expandedItem === item.productId._id;
                const isSelected = selectedItems.includes(item.productId._id);

                return (
                  <div
                    key={item.productId._id}
                    className={`cart-item-card ${isExpanded ? 'expanded' : ''}`}
                    onClick={(e) => handleCardClick(e, item.productId._id)}
                  >
                    <div className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          handleCheckboxChange(item.productId._id);
                        }}
                        className="cart-checkbox"
                      />
                    </div>
                    <div
                      className="product-image"
                      style={{ backgroundColor: item.productId.color || '#ccc' }}
                    ></div>
                    <h3>{item.productId.productName}</h3>
                    {isExpanded && (
                      <div className="expanded-details">
                        <p>Product Price: ₱{item.productId.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p>Commission Fee (1%): ₱{(item.productId.price * 0.01).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        <p>Total Price (with Fee): ₱{(priceWithFee * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      </div>
                    )}
                    {!isExpanded && (
                      <p>
                        Total Price: ₱{(priceWithFee * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                    )}
                    <p>Quantity: {item.quantity}</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.productId._id);
                      }}
                      className="remove-item-btn"
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
              <div className="cart-total">
                <h2>
                  Total Cart Price: ₱{calculateTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
                <button className="checkout-btn">Proceed to Checkout</button>
              </div>
            </div>
          ) : (
            <p className="empty-cart">Your cart is empty.</p>
          )}
        </div>
      </main>
    </>
  );
};

export default CartArea;