/* SellerOrdersArea.js */

import React, { useState, useEffect, useCallback } from 'react';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import './css/SellerOrdersArea.css';
import { useAuth } from '../components/AuthProvider';

const SellerOrdersArea = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('Pending'); // Default to "Pending"
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSellerOrders = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/seller-orders?BuyerStatus=${status === 'Pending' ? 'NotYetReceived' : 'Received'}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setOrders(result.orders || []);
        setError(null);
      } else {
        setOrders([]);
        setError(result.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching seller orders:', error.message);
      setError('An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  }, [status, token]);

  useEffect(() => {
    fetchSellerOrders();
  }, [fetchSellerOrders]);

  const handleNotifyBuyer = (buyerId) => {
    alert(`Notification sent to buyer with ID: ${buyerId}`); // Placeholder functionality
  };

  return (
    <>
      <TopNavbar />
      <div className="seller-orders-area-page">
        <SideBar />
        <div className="seller-orders-main">
          <h1>Seller Orders</h1>
          <div className="seller-orders-navigation">
            <button
              onClick={() => setStatus('Pending')}
              className={status === 'Pending' ? 'active' : ''}
            >
              Pending Orders
            </button>
            <button
              onClick={() => setStatus('Success')}
              className={status === 'Success' ? 'active' : ''}
            >
              Successful Orders
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length > 0 ? (
            <div className="seller-orders-container">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <p>
                    <strong>Buyer:</strong> {`${order.userId.first_name} ${order.userId.last_name}`}
                  </p>
                  <p>
                    <strong>Product:</strong> {order.listingId?.productName || 'No Product Details'}
                  </p>
                  <p>
                    <strong>Price:</strong> {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(order.totalPrice || 0)}
                  </p>
                  <p>
                    <strong>Buyer Status:</strong> {order.BuyerStatus || 'NotYetReceived'}
                  </p>
                  {status === 'Pending' && (
                    <button
                      onClick={() => handleNotifyBuyer(order.userId?._id)}
                      className="notify-btn"
                    >
                      Notify
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No orders found.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default SellerOrdersArea;