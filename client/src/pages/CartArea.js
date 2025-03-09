// CartArea.js

import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import './css/CartArea.css';

const CartPage = () => {
  const { token } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/cart', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (response.ok) {
        setCartItems(result.cartItems);
        updateTotalPrice(result.cartItems);
      } else {
        console.error('Failed to fetch cart items:', result);
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const updateTotalPrice = (items) => {
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(total);
  };

  const handleRemoveFromCart = (id) => {
    setCartItems(cartItems.filter((item) => item._id !== id));
    updateTotalPrice(cartItems.filter((item) => item._id !== id));
  };

  const handleCheckout = () => {
    // Logic for checkout (e.g., calculate total with commission)
    const siteCommission = totalPrice * 0.01; // Example: 1% site commission
    const totalAmount = totalPrice + siteCommission;

    alert(`Total Price: ₱${totalPrice}\nSite Commission: ₱${siteCommission}\nTotal Payable: ₱${totalAmount}`);
  };

  const handleSelectItem = (id) => {
    setSelectedItems((prevItems) => {
      if (prevItems.includes(id)) {
        return prevItems.filter((itemId) => itemId !== id);
      } else {
        return [...prevItems, id];
      }
    });
  };

  return (
    <div className="cart-page">
      <h2>Your Cart</h2>
      <div className="cart-items-container">
        {cartItems.map((item) => (
          <div key={item._id} className="cart-item-card">
            <input
              type="checkbox"
              checked={selectedItems.includes(item._id)}
              onChange={() => handleSelectItem(item._id)}
            />
            <h3>{item.productName}</h3>
            <p>Price: ₱{item.price}</p>
            <p>Quantity: {item.quantity}</p>
            <button onClick={() => handleRemoveFromCart(item._id)} className="remove-from-cart-btn">
              Remove from Cart
            </button>
          </div>
        ))}
      </div>
      <div className="cart-summary">
        <h3>Total Price: ₱{totalPrice}</h3>
        <button onClick={handleCheckout} className="checkout-btn">
          Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
