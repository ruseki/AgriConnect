//Admin.js

const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

const isAdminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admins only!' });
  }
  next();
};

router.get('/dashboard', auth, isAdminMiddleware, async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    res.status(200).json({
      message: 'Welcome to the admin dashboard!',
      usersCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching admin data', error: error.message });
  }
});

module.exports = router; 