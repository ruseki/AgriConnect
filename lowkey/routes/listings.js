import express from 'express';
import auth from '../middleware/auth.js';
import Listing, { genUniqIden } from '../models/Listing.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const { productName, quantity, unit, category, condition, details, location } = req.body;
    const userId = req.user._id;  // Retrieve userId from the authenticated user

    const identifier = await genUniqIden(Listing);

    const listing = new Listing({
      identifier,
      productName,
      quantity,
      unit,
      category,
      condition,
      details,
      location,
      userId,  // Pass userId to the backend
    });

    await listing.save();
    res.status(201).json({ message: 'Listing created successfully', listing });
  } catch (error) {
    console.error('Error creating listing:', error);  
    res.status(500).json({ 
      message: 'Error creating listing', 
      error: error.message || error 
    });
  }
});

export default router;
