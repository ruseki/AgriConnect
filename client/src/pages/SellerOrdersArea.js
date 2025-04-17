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
      const response = await fetch(`http://localhost:5000/api/orders/seller-orders?status=${status}&BuyerStatus=NotYetReceived`, {
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

  const handleMarkAsDone = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/mark-as-done/${orderId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        alert('Order marked as done.');
        setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId)); // Remove from list
      } else {
        alert('Failed to mark order as done.');
      }
    } catch (error) {
      console.error('Error marking order as done:', error.message);
      alert('An error occurred while marking the order as done.');
    }
  };

  const handleNotifyBuyer = (buyerId) => {
    alert(`Notification sent to buyer with ID: ${buyerId}`); // Mock notification
  };

  return (
    <>
      <TopNavbar />
      <div className="seller-orders-area-page">
        <SideBar />
        <div className="seller-orders-main">
          <div className="seller-orders-navigation">
            <button onClick={() => setStatus('Pending')} className={status === 'Pending' ? 'active' : ''}>
              Pending
            </button>
            <button onClick={() => setStatus('Approved')} className={status === 'Approved' ? 'active' : ''}>
              Approved
            </button>
            <button onClick={() => setStatus('Success')} className={status === 'Success' ? 'active' : ''}>
              Successful
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
                    <strong>Quantity:</strong> {order.quantity || 0} {order.unit || 'units'}
                  </p>
                  <p>
                    <strong>Total Price:</strong> {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(order.totalPrice || 0)}
                  </p>
                  <p>
                    <strong>Status:</strong> {order.status || 'Unknown'}
                  </p>
                  <p>
                    <strong>Buyer Status:</strong> {order.BuyerStatus || 'NotYetReceived'}
                  </p>
                  {order.BuyerStatus === 'NotYetReceived' && (
                    <div className="order-actions">
                      <button
                        onClick={() => handleMarkAsDone(order._id)}
                        className="mark-done-btn"
                      >
                        Mark as Done
                      </button>
                      <button
                        onClick={() => handleNotifyBuyer(order.userId?._id)}
                        className="notify-btn"
                      >
                        Notify Buyer
                      </button>
                    </div>
                  )}
                  {order.BuyerStatus === 'Received' && (
                    <p className="buyer-confirmed">Buyer has confirmed receipt.</p>
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