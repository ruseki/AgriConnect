const express = require('express');
const { login, registerUser, verifyEmail, forgotPassword, resetPassword, resendVerificationCode } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-verification-code', resendVerificationCode);

module.exports = router;
