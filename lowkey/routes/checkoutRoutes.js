//checkoutRoutes.js

import express from 'express';
import { submitCheckout, getAllCheckouts, updateCheckoutStatus, receivedCheckout, markAsDone } from '../controllers/checkoutController.js';
import auth from '../middleware/auth.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import upload from '../middleware/upload.js'; 
import CheckoutSubmission from '../models/CheckoutSubmission.js';
import UserBalance from '../models/UserBalance.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', auth, upload.single('proofImage'), submitCheckout);

router.get('/all-checkouts', auth, adminMiddleware, getAllCheckouts);

router.patch('/:id', auth, adminMiddleware, updateCheckoutStatus);

router.post('/received/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    const checkout = await CheckoutSubmission.findById(id)
      .populate('listingId', 'userId'); 

    if (!checkout) {
      console.error('Checkout not found for ID:', id);
      return res.status(404).json({ message: 'Checkout not found.' });
    }

    console.log('Checkout found:', checkout);
    console.log('Listing owner (userId):', checkout.listingId.userId);

    const sellerBalance = await UserBalance.findOne({ userId: checkout.listingId.userId });

    if (!sellerBalance) {
      console.log('Creating new UserBalance for listing owner:', checkout.listingId.userId);
      await new UserBalance({
        userId: checkout.listingId.userId,
        sellerBalance: checkout.totalPrice,
        transactions: [
          { amount: checkout.totalPrice, type: 'credit', referenceId: checkout._id },
        ],
      }).save();
    } else {
      console.log('Updating balance for listing owner:', checkout.listingId.userId);
      sellerBalance.sellerBalance += checkout.totalPrice;
      sellerBalance.transactions.push({
        amount: checkout.totalPrice,
        type: 'credit',
        referenceId: checkout._id,
      });
      await sellerBalance.save();
    }

    checkout.BuyerStatus = 'Received';
    await checkout.save();

    res.status(200).json({ message: 'Order marked as Received successfully.', checkout });
  } catch (error) {
    console.error('Error marking order as Received:', error.message);
    res.status(500).json({ message: 'Failed to mark order as Received.' });
  }
});

router.patch('/mark-as-done/:id', auth, markAsDone);

router.patch('/mark-success/:id', authMiddleware, async (req, res) => {
  try {
    console.log('Request Params:', req.params); 
    console.log('Request Body:', req.body); 

    const { id } = req.params;
    const { status } = req.body;

    const statusToApply = status || 'Success'; 

    if (statusToApply !== 'Success') {
      console.error('Invalid status provided.');
      return res.status(400).json({ message: 'Status is required and must be "Success".' });
    }

    const checkout = await CheckoutSubmission.findById(id);
    if (!checkout) {
      console.error('Checkout not found for ID:', id);
      return res.status(404).json({ message: 'Checkout not found.' });
    }

    if (checkout.status !== 'Approved') {
      return res.status(400).json({ message: 'Checkout must be "Approved" before it can be marked as "Success".' });
    }

    checkout.status = 'Success';
    checkout.BuyerStatus = 'Received';
    await checkout.save();

    console.log('Checkout updated successfully:', checkout);
    res.status(200).json({ message: 'Checkout marked as Success.', checkout });
  } catch (error) {
    console.error('Error updating checkout:', error.message);
    res.status(500).json({ message: 'Failed to mark checkout as Success.', error: error.message });
  }
});

export default router;