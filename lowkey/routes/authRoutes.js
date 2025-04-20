// authRoutes.js

import express from 'express';
import { login, registerUser, verifyEmail, forgotPassword, resetPassword, resendVerificationCode, sendVerificationEmail, getUser } from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import AdminRoutes from './Admin.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', registerUser);
router.post('/verify-email', verifyEmail);  
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-verification-code', resendVerificationCode);
router.post('/send-verification-email', auth, sendVerificationEmail);
router.get('/user', auth, getUser);

router.use('/admin', AdminRoutes);

export default router;
