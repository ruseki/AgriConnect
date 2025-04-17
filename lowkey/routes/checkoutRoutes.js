//checkoutRoutes.js

import express from 'express';
import { submitCheckout, getAllCheckouts, updateCheckoutStatus, receivedCheckout, markAsDone } from '../controllers/checkoutController.js';
import auth from '../middleware/auth.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import upload from '../middleware/upload.js'; // Import the upload middleware

const router = express.Router();

// User submits checkout proof
router.post('/submit', auth, upload.single('proofImage'), submitCheckout);

// Admin views all submissions
router.get('/all-checkouts', auth, adminMiddleware, getAllCheckouts);

// Admin updates the status of a checkout submission
router.patch('/:id', auth, adminMiddleware, updateCheckoutStatus);

// Buyer marks checkout as received
router.post('/received/:id', auth, receivedCheckout);

// Seller marks order as done
router.patch('/mark-as-done/:id', auth, markAsDone);

export default router;