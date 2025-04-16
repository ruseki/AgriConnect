//OrderStatus.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import { useLocation } from 'react-router-dom';
import './css/OrderStatus.css';

const OrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Set the status dynamically based on the current route
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('pending')) {
      setStatus('Pending');
    } else if (path.includes('orders')) {
      setStatus('Approved');
    } else if (path.includes('successful')) {
      setStatus('Success');
    }
  }, [location]);

  // Fetch orders by status from the backend
  useEffect(() => {
    const fetchOrdersByStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(`http://localhost:5000/api/checkout-status/${status}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 200 && response.data.checkouts) {
          setOrders(response.data.checkouts);
        } else {
          setOrders([]);
        }
      } catch (error) {
        console.error('Error fetching orders:', error.message);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (status) {
      fetchOrdersByStatus();
    }
  }, [status]);

  // Handle canceling an order
  const handleCancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(`http://localhost:5000/api/checkout-status/cancel/${orderId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        alert('Order canceled successfully.');
        setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId)); // Remove from list
      } else {
        alert('Failed to cancel order.');
      }
    } catch (error) {
      console.error('Error canceling order:', error.message);
      alert('An error occurred while trying to cancel the order.');
    }
  };

  return (
    <>
      <TopNavbar />
      <div className="orderstats-page">
        <SideBar />
        <div className="orderstats-main">
          {/* Navigation Buttons */}
          <div className="orderstats-navigation">
            <button onClick={() => setStatus('Pending')} className={status === 'Pending' ? 'active' : ''}>
              Pending
            </button>
            <button onClick={() => setStatus('Approved')} className={status === 'Approved' ? 'active' : ''}>
              Orders
            </button>
            <button onClick={() => setStatus('Success')} className={status === 'Success' ? 'active' : ''}>
              Successful Orders
            </button>
          </div>

          {/* Dynamic message for Orders page */}
          {status === 'Approved' && <p className="orders-info">The seller has been notified about these orders.</p>}

          {/* Orders List */}
          <div className="orderstats-container">
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length > 0 ? (
              <ul className="orderstats-list">
                {orders.map((order) => (
                  <li key={order._id} className="orderstats-list-item">
                    <div>
                      <strong>Buyer:</strong> {`${order.userId.first_name} ${order.userId.last_name}`}
                    </div>
                    <div>
                      <strong>Product:</strong> {order.listingId?.productName || 'Removed Product'}
                    </div>
                    <div>
                      <strong>Status:</strong> {order.status}
                    </div>
                    {status === 'Pending' && (
                      <div>
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No orders found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderStatus;