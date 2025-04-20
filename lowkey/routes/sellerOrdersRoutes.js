//sellerOrdersRoutes.js

import express from 'express';
import auth from '../middleware/auth.js';
import SellerOrder from '../models/SellerOrders.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const sellerId = req.user._id;
    console.log('Fetching orders for Seller ID:', sellerId);

    const orders = await SellerOrder.find({ sellerId })
      .populate('userId', 'first_name last_name email')
      .populate({
        path: 'listingId',
        select: 'productName quantity unit price'
      });

    if (!orders || orders.length === 0) {
      console.log('No orders found for seller:', sellerId);
      return res.status(200).json({ orders: [] });
    }

    console.log('=== API Response Data ===');
    console.log('Number of orders:', orders.length);
    orders.forEach((order, index) => {
      console.log(`\nOrder ${index + 1}:`);
      console.log('Order ID:', order._id);
      console.log('Quantity:', order.quantity);
      console.log('Total Price:', order.totalPrice);
      console.log('Status:', order.status);
      console.log('Buyer:', order.userId?.first_name, order.userId?.last_name);
      console.log('Product:', order.listingId?.productName);
      console.log('Listing Price:', order.listingId?.price);
      console.log('Listing Quantity:', order.listingId?.quantity);
      console.log('Listing Unit:', order.listingId?.unit);
    });

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching seller orders:', error.message);
    res.status(500).json({ message: 'Error fetching seller orders', error: error.message });
  }
});



export default router;