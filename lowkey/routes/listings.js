import express from 'express';
import auth from '../middleware/auth.js';
import Listing, { genUniqIden } from '../models/Listing.js';

const router = express.Router();

router.get('/user-listings', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Fetching listings for userId:', userId);

    const listings = await Listing.find({ userId });

    if (listings.length === 0) {
      console.log('No listings found for userId:', userId);
      return res.status(200).json({ listings: [] });
    }

    res.status(200).json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Fetching listings excluding the current user:', userId);

    // Fetch all listings (remove the conditions temporarily)
    const listings = await Listing.find({
      userId: { $ne: userId },  // Exclude the current user's listings
    });

    if (listings.length === 0) {
      console.log('No listings found');
      return res.status(200).json({ listings: [] });
    }

    res.status(200).json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
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
    console.error('Error marking listing as sold:', error);
    res.status(500).json({ message: 'Error marking listing as sold' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id; 
    console.log('Fetching listings excluding the current user:', userId);

    const listings = await Listing.find({
      userId: { $ne: userId },  // Exclude the current user's listings
      status: 'available',  // Only available listings
      stocks: { $gt: 0 },    // Ensure the product has stocks available
    });

    console.log('Fetched Listings:', listings); // Add this log to check the fetched listings

    if (!listings || listings.length === 0) {
      console.log('No available listings found');
      return res.status(200).json({ listings: [] });
    }

    res.status(200).json({ listings });
  } catch (error) {
    console.error('Error fetching listings:', error);
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
});


router.put('/:id', auth, async (req, res) => {
  try {
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
    console.error('Error updating listing:', error);
    res.status(500).json({ message: 'Error updating listing' });
  }
});

export default router;
