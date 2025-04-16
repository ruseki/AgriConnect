/* SellerOrdersArea.js */

import React, { useState, useEffect, useCallback } from 'react';
import TopNavbar from '../components/top_navbar';
import SideBar from '../components/side_bar';
import './css/SellerOrdersArea.css';
import { useAuth } from '../components/AuthProvider';

const SellerOrdersArea = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSellerOrders = useCallback(async () => {
    try {
      console.log('=== Frontend API Request ===');
      console.log('Token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(`http://localhost:5000/api/orders/seller-orders`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      console.log('=== Frontend API Response ===');
      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);
      console.log('Raw Response Data:', result);

      if (response.ok) {
        console.log('\n=== Processing Orders Data ===');
        console.log('Number of orders received:', result.orders?.length || 0);
        
        // Validate that each order has required fields
        const validatedOrders = result.orders.map(order => {
          console.log(`\nProcessing Order ${order._id}:`);
          console.log('Raw Order Data:', order);
          
          if (!order.quantity || !order.totalPrice) {
            console.warn('Order missing required fields:', {
              orderId: order._id,
              quantity: order.quantity,
              totalPrice: order.totalPrice
            });
          }
          
          const validatedOrder = {
            ...order,
            quantity: order.quantity || 0,
            totalPrice: order.totalPrice || 0
          };
          
          console.log('Validated Order Data:', validatedOrder);
          return validatedOrder;
        });
        
        console.log('\n=== Setting Final Orders State ===');
        console.log('Number of validated orders:', validatedOrders.length);
        setOrders(validatedOrders);
        setError(null);
      } else {
        console.error('Failed to fetch seller orders:', result);
        setError(result.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching seller orders:', error);
      setError('An error occurred while fetching orders');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSellerOrders();
  }, [fetchSellerOrders]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  return (
    <>
      <TopNavbar />
      <div className="seller-orders-area-page">
        <SideBar />
        <div className="seller-orders-main">
          <h1>Seller Orders Area</h1>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {loading ? (
            <p>Loading orders...</p>
          ) : orders.length > 0 ? (
            <div className="seller-orders-container">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <p><strong>Buyer:</strong> {order.userId?.first_name} {order.userId?.last_name}</p>
                  <p><strong>Product:</strong> {order.listingId?.productName || 'No Product Details'}</p>
                  <p><strong>Quantity:</strong> {order.quantity || 0} {order.unit || 'units'}</p>
                  <p><strong>Total Price:</strong> {formatPrice(order.totalPrice || 0)}</p>
                  <p><strong>Status:</strong> {order.status || 'Unknown'}</p>
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