//checkoutStatus.js

import express from 'express';
import { updateCheckoutStatus, getCheckoutsByStatus } from '../controllers/checkoutController.js';
import authMiddleware from '../middleware/auth.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import CheckoutSubmission from '../models/CheckoutSubmission.js';
import SellerOrder from '../models/SellerOrders.js';
import Listing from '../models/Listing.js';
import { fetchPaginatedCheckouts } from '../controllers/checkoutController.js';

const router = express.Router();

// Fetch all checkouts by status (Admin & User-specific)
router.get('/:status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.params;
    const userId = req.userId; // Extracted from authMiddleware
    const checkouts = await getCheckoutsByStatus(status, userId);
    res.status(200).json({ checkouts });
  } catch (error) {
    console.error('Error fetching checkouts:', error.message);
    res.status(500).json({ message: 'Failed to fetch checkouts.' });
  }
});

// Update checkout status (Admin)
router.patch('/:id', authMiddleware, async (req, res) => {
  try {
    const { status, approvalNote } = req.body;
    const checkout = await CheckoutSubmission.findById(req.params.id);

    if (!checkout) {
      console.error('Checkout not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Checkout not found' });
    }

    console.log('Checkout found:', checkout);
    console.log('Quantity:', checkout.quantity);
    console.log('Total Price:', checkout.totalPrice);

    // Update the status of the checkout submission
    checkout.status = status;
    checkout.approvalNote = approvalNote;
    checkout.reviewedAt = new Date();
    checkout.reviewedBy = req.user._id;
    await checkout.save();
    console.log('Checkout updated successfully:', checkout);

    // Create a new SellerOrder if the status is Approved
    if (status === 'Approved') {
      const { quantity, totalPrice } = checkout;
      
      // Validate required fields
      if (!quantity || !totalPrice) {
        console.error('Missing required fields: quantity or totalPrice.');
        return res.status(400).json({
          message: 'Cannot create SellerOrder. Missing required fields: quantity or totalPrice.',
        });
      }

      const listing = await Listing.findById(checkout.listingId);
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      // Create a new seller order
      const sellerOrder = new SellerOrder({
        sellerId: listing.userId,
        userId: checkout.userId,
        listingId: checkout.listingId,
        quantity: quantity,
        totalPrice: totalPrice,
        status: 'Approved'
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

// Cancel a checkout (Admin)
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

// Fetch all checkouts with pagination (Admin)
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