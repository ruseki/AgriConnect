// routes/userRoutes.js

import express from 'express';
import auth from '../middleware/auth.js'; 
import User from '../models/User.js'; 

const router = express.Router();

router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'first_name middle_name last_name email createdAt'
    ); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      firstName: user.first_name,
      middleName: user.middle_name || '',
      lastName: user.last_name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
});

export default router;
