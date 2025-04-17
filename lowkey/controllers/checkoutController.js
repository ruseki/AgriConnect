/* checkoutController */

import CheckoutSubmission from '../models/CheckoutSubmission.js';
import Cart from '../models/Cart.js';
import User from '../models/User.js'; // Ensure User model is imported
import Listing from '../models/Listing.js'; // Ensure Listing model is imported

// Submit a checkout (User)
export const submitCheckout = async (req, res) => {
  try {
    const { bank, referenceNumber, listingId, quantity } = req.body;
    const proofImage = req.file?.path; // Path to the uploaded image

    if (!proofImage) {
      return res.status(400).json({ message: 'Proof image is required.' });
    }

    if (!listingId) {
      return res.status(400).json({ message: 'Listing ID is required.' });
    }

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: 'Valid quantity is required.' });
    }

    // Find the listing to get the price
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }

    // Calculate total price with 1% commission fee
    const totalPrice = (quantity * listing.price) * 1.01;

    const newCheckout = new CheckoutSubmission({
      userId: req.userId,
      listingId,
      bank,
      referenceNumber,
      proofImage,
      quantity,
      totalPrice,
      status: 'Pending', // Admin-centric status
      BuyerStatus: 'NotYetReceived', // New BuyerStatus field
    });

    console.log('New Checkout Submission:', {
      listingId,
      quantity,
      price: listing.price,
      totalPrice,
      status: 'Pending',
      BuyerStatus: 'NotYetReceived',
    });

    // Remove item from the cart
    await Cart.findOneAndUpdate(
      { userId: req.userId },
      { $pull: { items: { productId: listingId } } }
    );

    await newCheckout.save();

    res.status(201).json({
      message: 'Payment details submitted successfully',
      checkout: newCheckout,
    });
  } catch (error) {
    console.error('Error submitting payment:', error.message);
    res.status(500).json({ message: 'Failed to submit payment details.' });
  }
};

// Get all checkouts (Admin)
export const getAllCheckouts = async (req, res) => {
  try {
    const checkouts = await CheckoutSubmission.find()
      .populate('userId', 'first_name last_name email')
      .populate({
        path: 'listingId',
        select: 'userId identifier',
        populate: {
          path: 'userId',
          select: 'first_name last_name email',
        },
      });

    console.log('Checkouts with submittedAt:', checkouts.map((c) => c.submittedAt)); // Add log
    res.status(200).json({ checkouts });
  } catch (error) {
    console.error('Error fetching checkouts:', error.message);
    res.status(500).json({ message: 'Failed to fetch checkouts.' });
  }
};

// Get checkouts by status (Admin & User-specific)
export const getCheckoutsByStatus = async (status, userId) => {
  try {
    const checkouts = await CheckoutSubmission.find({ status, userId }) // Filter by userId
      .populate('userId', 'first_name last_name email') // Populate buyer info
      .populate({
        path: 'listingId',
        select: 'productName userId', // Fetch the product name and seller's userId
      });
    return checkouts;
  } catch (error) {
    throw new Error('Error fetching checkouts by status: ' + error.message);
  }
};

// Update checkout status (Admin)
export const updateCheckoutStatus = async (id, status, userId, note) => {
  try {
    const user = await User.findById(userId); // Ensure `User` model is imported
    const handledBy = `handled by: ${user.first_name} ${user.last_name}`;
    const fullNote = note ? `${note}\n\n${handledBy}` : handledBy;

    const updatedCheckout = await CheckoutSubmission.findByIdAndUpdate(
      id,
      { status, approvedAt: new Date(), reviewedBy: userId, approvalNote: fullNote },
      { new: true }
    );

    if (!updatedCheckout) {
      throw new Error('Checkout submission not found.');
    }

    return updatedCheckout;
  } catch (error) {
    throw new Error('Error updating checkout status: ' + error.message);
  }
};

export const fetchPaginatedCheckouts = async (page, limit) => {
  try {
    const checkouts = await CheckoutSubmission.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'first_name last_name email')
      .populate('listingId', 'identifier userId');

    const totalCheckouts = await CheckoutSubmission.countDocuments();
    const totalPages = Math.ceil(totalCheckouts / limit);

    return { checkouts, totalPages };
  } catch (error) {
    throw new Error('Error fetching checkouts: ' + error.message);
  }
};

// Buyer confirms receipt of order
export const receivedCheckout = async (req, res) => {
  console.log('Received endpoint hit:', req.params.id);
  try {
    const { id } = req.params;

    const checkout = await CheckoutSubmission.findById(id);
    if (!checkout) {
      return res.status(404).json({ message: 'Checkout not found.' });
    }

    if (checkout.BuyerStatus === 'Received') {
      return res.status(400).json({ message: 'Order already marked as Received.' });
    }

    // Update BuyerStatus to 'Received'
    checkout.BuyerStatus = 'Received';
    await checkout.save();

    res.status(200).json({ message: 'Buyer marked order as Received.', checkout });
  } catch (error) {
    console.error('Error marking checkout as Received:', error.message);
    res.status(500).json({ message: 'Failed to update BuyerStatus.' });
  }
};

// Seller marks order as done
export const markAsDone = async (req, res) => {
  try {
    const { id } = req.params;

    const sellerOrder = await SellerOrder.findById(id);
    if (!sellerOrder || sellerOrder.status !== 'Approved') {
      return res.status(400).json({ message: 'Order not eligible for marking as done.' });
    }

    sellerOrder.status = 'Shipped'; // Or 'Done', based on your terminology
    await sellerOrder.save();

    res.status(200).json({ message: 'Order marked as done successfully.', sellerOrder });
  } catch (error) {
    console.error('Error marking order as done:', error.message);
    res.status(500).json({ message: 'Failed to mark order as done.' });
  }
};