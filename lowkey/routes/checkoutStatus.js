//checkoutStatus.js

import express from 'express';
import { updateCheckoutStatus, getCheckoutsByStatus } from '../controllers/checkoutController.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import CheckoutSubmission from '../models/CheckoutSubmission.js';
import SellerOrder from '../models/SellerOrders.js';
import Listing from '../models/Listing.js';
import { fetchPaginatedCheckouts } from '../controllers/checkoutController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { status } = req.query; 
    const userId = req.userId; 

    const checkouts = await CheckoutSubmission.find({ status, userId })
      .populate('userId', 'first_name last_name email')
      .populate({
        path: 'listingId',
        select: 'productName userId',
        populate: { path: 'userId', select: 'first_name last_name email' },
      });

    if (checkouts.length === 0) {
      return res.status(404).json({ message: 'No orders found for the specified status.' });
    }

    res.status(200).json({ checkouts });
  } catch (error) {
    console.error('Error fetching checkouts:', error.message);
    res.status(500).json({ message: 'Failed to fetch checkouts.' });
  }
});

router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, approvalNote } = req.body;

    console.log('Incoming Request Data:', { status, approvalNote, id: req.params.id });

    const checkout = await CheckoutSubmission.findById(req.params.id);
    if (!checkout) {
      console.error('Checkout not found for ID:', req.params.id); 
      return res.status(404).json({ message: 'Checkout not found' });
    }

    if (!status) {
      console.error('Status field missing in request body.');
      return res.status(400).json({ message: 'Status is required.' });
    }

    console.log('Checkout Before Update:', checkout); 

    checkout.status = status;
    checkout.approvalNote = approvalNote;
    checkout.reviewedAt = new Date();
    checkout.reviewedBy = req.user._id;

    await checkout.save(); 
    console.log('Checkout After Update:', checkout); 

    if (status === 'Approved') {
      const { quantity, totalPrice } = checkout;

      if (!quantity || !totalPrice) {
        console.error('Missing required fields: quantity or totalPrice.');
        return res.status(400).json({
          message: 'Cannot create SellerOrder. Missing required fields: quantity or totalPrice.',
        });
      }

      const listing = await Listing.findById(checkout.listingId);
      if (!listing) {
        console.error('Listing not found for ID:', checkout.listingId);
        return res.status(404).json({ message: 'Listing not found' });
      }

      const sellerOrder = new SellerOrder({
        sellerId: listing.userId,
        userId: checkout.userId,
        listingId: checkout.listingId,
        quantity: quantity,
        totalPrice: totalPrice,
        status: 'Approved',
      });

      await sellerOrder.save(); 
      console.log('SellerOrder created successfully:', sellerOrder); 
    }

    res.status(200).json({ message: 'Checkout updated successfully', checkout });
  } catch (error) {
    console.error('Error updating checkout:', error.message); 
    res.status(500).json({ message: 'Failed to update checkout', error: error.message });
  }
});

router.post('/cancel/:id', authMiddleware, async (req, res) => {
  console.log('Order ID to Cancel:', req.params.id);
  const { id } = req.params;

  try {
    const checkout = await CheckoutSubmission.findById(id);

    if (!checkout || checkout.status !== 'Pending') {
      return res.status(400).json({ message: 'Cannot cancel non-pending checkout.' });
    }

    await CheckoutSubmission.findByIdAndDelete(id);
    res.status(200).json({ message: 'Checkout canceled successfully.' });
  } catch (error) {
    console.error('Error canceling checkout:', error.message);
    res.status(500).json({ message: 'Failed to cancel checkout.' });
  }
});

router.get('/all-checkouts', adminMiddleware, async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  try {
    const { checkouts, totalPages } = await fetchPaginatedCheckouts(page, limit);
    res.status(200).json({ checkouts, totalPages });
  } catch (error) {
    console.error('Error fetching checkouts:', error.message);
    res.status(500).json({ message: 'Failed to fetch checkouts.' });
  }
});

export default router;