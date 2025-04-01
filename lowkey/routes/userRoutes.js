import express from 'express';
import auth from '../middleware/auth.js';
import adminMiddleware from '../middleware/adminMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

router.get('/user', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select(
      'first_name middle_name last_name email isAdmin createdAt'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      userId: user._id,
      firstName: user.first_name,
      middleName: user.middle_name || '',
      lastName: user.last_name,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user data', error: error.message });
  }
});

router.get('/users', auth, adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select(
      'userId first_name last_name email isVerified isSeller activeListings icon'
    );

    if (!users.length) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

router.patch('/approve-seller/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: 'Cannot approve seller role: Email is not verified.' });
    }

    user.isSeller = true;
    await user.save();

    res.status(200).json({ message: 'User approved as seller', user });
  } catch (error) {
    console.error('Error approving seller:', error.message);
    res.status(500).json({ message: 'Server error while approving seller', error: error.message });
  }
});

router.patch('/remove-seller/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isSeller = false;
    await user.save();

    res.status(200).json({ message: 'Seller role removed successfully', user });
  } catch (error) {
    console.error('Error removing seller role:', error.message);
    res.status(500).json({ message: 'Server error while removing seller role', error: error.message });
  }
});

export default router;
