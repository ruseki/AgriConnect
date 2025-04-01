//routes/listings.js

import express from 'express';
import auth from '../middleware/auth.js';
import { addIdentifier } from '../middleware/list.js';
import Listing from '../models/Listing.js';

const router = express.Router();

router.get('/user-listings', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('Fetching user listings for User ID:', userId);

    const listings = await Listing.find({ userId });

    if (listings.length === 0) {
      console.log('No listings found for User ID:', userId);
      return res.status(200).json({ listings: [] });
    }

    res.status(200).json({ listings });
  } catch (error) {
    console.error('Error fetching user listings:', error.message);
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Logged-in User ID:', userId);

    const listings = await Listing.find({
      userId: { $ne: userId },
      status: true, // Update from 'available' to true
      quantity: { $gt: 0 },
    })
      .populate('userId', 'first_name last_name')
      .select('productName category price quantity unit details color userId listedDate status');

    if (!listings || listings.length === 0) {
      console.log('No available listings found.');
      return res.status(200).json({ listings: [] });
    }

    const updatedListings = listings.map((listing) => ({
      ...listing.toObject(),
      seller: `${listing.userId.first_name} ${listing.userId.last_name}`,
      description: listing.details,
    }));

    console.log('Updated Listings with Seller Information:', updatedListings);

    res.status(200).json({ listings: updatedListings });
  } catch (error) {
    console.error('Error fetching listings:', error.message);
    res.status(500).json({ message: 'Error fetching listings', error: error.message });
  }
});



router.post('/', auth, addIdentifier, async (req, res) => {
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

    console.log('Marking listing as sold. Listing ID:', id);

    const listing = await Listing.findById(id);

    if (!listing) {
      console.log('Listing not found. Listing ID:', id);
      return res.status(404).json({ message: 'Listing not found' });
    }

    listing.status = false; // Update to Boolean false
    await listing.save();

    console.log('Listing successfully marked as sold:', listing);

    res.status(200).json({ message: 'Listing marked as sold', listing });
  } catch (error) {
    console.error('Error marking listing as sold:', error.message);
    res.status(500).json({ message: 'Error marking listing as sold', error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Incoming PUT request to update a listing. Listing ID:', req.params.id);
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
      console.log('Listing not found. Listing ID:', id);
      return res.status(404).json({ message: 'Listing not found' });
    }

    console.log('Listing successfully updated:', updatedListing);

    res.status(200).json({ message: 'Listing updated successfully', updatedListing });
  } catch (error) {
    console.error('Error updating listing:', error.message);
    res.status(500).json({ message: 'Error updating listing', error: error.message });
  }
});


// Unlist Product
router.put("/:identifier/unlist", auth, async (req, res) => {
  try {
    const { identifier } = req.params; // Extract identifier from request params
    console.log("Unlisting Product Identifier:", identifier);

    const updatedListing = await Listing.findOneAndUpdate(
      { identifier }, // Match by identifier instead of _id
      { status: false }, // Set status to false
      { new: true } // Return the updated listing
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    console.log("Listing successfully unlisted:", updatedListing);
    res.status(200).json({ message: "Listing successfully unlisted", listing: updatedListing });
  } catch (error) {
    console.error("Error unlisting product:", error.message);
    res.status(500).json({ message: "Error unlisting product", error: error.message });
  }
});

// Relist Product
router.put("/:identifier/relist", auth, async (req, res) => {
  try {
    const { identifier } = req.params; // Extract identifier from request params
    console.log("Relisting Product Identifier:", identifier);

    const updatedListing = await Listing.findOneAndUpdate(
      { identifier }, // Match by identifier instead of _id
      { status: true }, // Set status to true
      { new: true } // Return the updated listing
    );

    if (!updatedListing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    console.log("Listing successfully relisted:", updatedListing);
    res.status(200).json({ message: "Listing successfully relisted", listing: updatedListing });
  } catch (error) {
    console.error("Error relisting product:", error.message);
    res.status(500).json({ message: "Error relisting product", error: error.message });
  }
});
router.delete('/delete/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedListing = await Listing.findByIdAndDelete(id);

    if (!deletedListing) {
      return res.status(404).json({ message: "Listing not found." });
    }

    res.status(200).json({ message: "Listing successfully deleted!" });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
});

export default router;
