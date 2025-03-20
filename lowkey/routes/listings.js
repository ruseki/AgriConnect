// listings.js

import express from 'express';
import auth from '../middleware/auth.js';
import Listing from '../models/Listing.js';

const router = express.Router();

router.get('/user-listings', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    const listings = await Listing.find({ userId });

    if (listings.length === 0) {
      return res.status(200).json({ listings: [] });
    }

    res.status(200).json({ listings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id; 
    console.log('Logged-in User ID:', userId);

    const listings = await Listing.find({
      userId: { $ne: userId }, 
      status: 'available', 
      quantity: { $gt: 0 }, 
    });

    if (!listings || listings.length === 0) {
      return res.status(200).json({ listings: [] });
    }

    res.status(200).json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error.message);
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    console.log('Incoming POST request to create a listing');
    console.log('Incoming Payload:', req.body);

    const { identifier, productName, quantity, unit, category, condition, details, location, price, color, minimumOrder } = req.body;
    const userId = req.user._id;

    console.log('Extracted user ID from auth middleware:', userId);

    const newListing = new Listing({
      identifier, 
      productName,
      quantity,
      unit,
      category,
      condition,
      details,
      location,
      price,
      color,
      minimumOrder,
      userId,
    });

    console.log('New Listing before save:', newListing);

    await newListing.save();

    console.log('Listing successfully saved to the database:', newListing);

    res.status(201).json({ message: 'Listing published!', listing: newListing });
  } catch (error) {
    console.error('Error creating listing:', error.message);
    res.status(500).json({ message: 'Error creating listing', error: error.message });
  }
});

router.patch('/mark-as-sold/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    listing.status = 'sold';
    await listing.save();

    res.status(200).json({ message: 'Listing marked as sold', listing });
  } catch (error) {
    res.status(500).json({ message: 'Error marking listing as sold' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Incoming Payload:', req.body);
    const { productName, quantity, unit, category, condition, details, location, price, color } = req.body;
    const { id } = req.params;

    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      {
        productName,
        quantity,
        unit,
        category,
        condition,
        details,
        location,
        price,
        color,
      },
      { new: true }
    );

    if (!updatedListing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.status(200).json({ message: 'Listing updated successfully', updatedListing });
  } catch (error) {
    res.status(500).json({ message: 'Error updating listing' });
  }
});

export default router;
