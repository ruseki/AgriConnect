import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import { useLocation, useNavigate } from 'react-router-dom';
import './css/OrderStatus.css';

const OrderStatus = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine the status based on the URL path
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

  // Fetch orders based on the status
  useEffect(() => {
    const fetchOrdersByStatus = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get(
          `http://localhost:5000/api/checkout-status?status=${status}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200 && response.data.checkouts) {
          setOrders(
            response.data.checkouts.filter((order) => {
              if (status === 'Success') {
                return order.status === 'Success' && order.BuyerStatus === 'Received';
              }
              return order.status === status;
            })
          );
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

  // Handle "Received" action
  const handleReceivedOrder = async (id) => {
    if (!id) {
      alert('No order selected.');
      return;
    }
  
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        `http://localhost:5000/api/checkout/received/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.status === 200) {
        alert('Order marked as received and balance updated!');
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id
              ? { ...order, BuyerStatus: 'Received', status: 'Success' }
              : order
          )
        );
        setShowModal(false);
      }
    } catch (error) {
      console.error('Error marking order as received:', error.message);
      alert('Failed to mark order as received.');
    }
  };

  return (
    <>
      <TopNavbar />
      <div className="orderstats-page">
        <SideBar />
        <div className="orderstats-main">
          <div className="orderstats-navigation">
            <button
              onClick={() => setStatus('Pending')}
              className={status === 'Pending' ? 'active' : ''}
            >
              Pending
            </button>
            <button
              onClick={() => setStatus('Approved')}
              className={status === 'Approved' ? 'active' : ''}
            >
              Orders
            </button>
            <button
              onClick={() => setStatus('Success')}
              className={status === 'Success' ? 'active' : ''}
            >
              Successful Orders
            </button>
          </div>

          {status === 'Approved' && (
            <p className="orders-info">
              The seller has been notified about these orders.
            </p>
          )}

          <div className="orderstats-container">
            {loading ? (
              <p>Loading orders...</p>
            ) : orders.length > 0 ? (
              <ul className="orderstats-list">
                {orders.map((order) => (
                  <li key={order._id} className="orderstats-list-item">
                    <div>
                      <strong>Buyer:</strong>{' '}
                      {`${order.userId.first_name} ${order.userId.last_name}`}
                    </div>
                    <div>
                      <strong>Product:</strong>{' '}
                      {order.listingId?.productName || 'Removed Product'}
                    </div>
                    <div>
                      <strong>Total Price:</strong> ₱
                      {order.totalPrice?.toFixed(2) || 'N/A'}
                    </div>
                    <div>
                      <strong>Status:</strong> {order.status}
                    </div>
                    {status === 'Approved' && order.BuyerStatus !== 'Received' && (
                      <div>
                        <button
                          onClick={() => {
                            setSelectedOrder(order._id);
                            setShowModal(true);
                          }}
                          className="received-btn"
                        >
                          Received
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

      {/* Modal for "Received" Confirmation */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p>This will release the payment to the seller. Do you want to proceed?</p>
            <div className="modal-buttons">
              <button
                onClick={() => handleReceivedOrder(selectedOrder)}
                className="confirm-btn"
              >
                Confirm
              </button>
              <button onClick={() => setShowModal(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderStatus;