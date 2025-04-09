import express from 'express';
import auth from '../middleware/auth.js';
import { getCart, addToCart, removeFromCart } from '../controllers/cartController.js';

const router = express.Router();

router.get('/', auth, getCart); // Fetch cart items
router.post('/add', auth, addToCart); // Add item to cart
router.post('/remove', auth, removeFromCart); // Remove item from cart

export default router;