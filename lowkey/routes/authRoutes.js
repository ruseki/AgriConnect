//authRoutes.js

const express = require('express');
const { login, registerUser, verifyEmail, forgotPassword, resetPassword, resendVerificationCode, sendVerificationEmail, getUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);  // Ensure this line is correct
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-verification-code', resendVerificationCode);
router.post('/send-verification-email', auth, sendVerificationEmail);
router.get('/user', auth, getUser); // Add new route for fetching user data

module.exports = router;
