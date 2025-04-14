import express from 'express';
import { submitCheckout, getAllCheckouts, updateCheckoutStatus } from '../controllers/checkoutController.js';
import auth from '../middleware/auth.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import upload from '../middleware/upload.js'; // Import the upload middleware

const router = express.Router();

// User submits checkout proof
router.post('/submit', auth, upload.single('proofImage'), submitCheckout);

// Admin views all submissions
router.get('/', auth, adminMiddleware, getAllCheckouts);

// Admin updates the status of a checkout submission
router.patch('/:id', auth, adminMiddleware, updateCheckoutStatus);

// Endpoint for submitting proof of payment
router.post('/checkout', auth, upload.single('proofImage'), submitCheckout);

export default router;