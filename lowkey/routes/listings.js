const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Listing = require('../models/Listing');

router.post('/', auth, async (req, res) => {
  try {
    const { productName, quantity, unit, category, condition, details, location } = req.body;
    const listerEmail = req.user.email; 

    const listing = new Listing({ 
      productName, 
      quantity, 
      unit, 
      category, 
      condition, 
      details, 
      location, 
      listerEmail 
    });

    await listing.save();
    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (error) {
    console.error('Error creating listing:', error); 
    res.status(500).json({ message: 'Error creating listing', error });
  }
});

module.exports = router;
