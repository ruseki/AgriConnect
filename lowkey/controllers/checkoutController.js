/* checkoutController */

import CheckoutSubmission from '../models/CheckoutSubmission.js';
import Cart from '../models/Cart.js';
import UserBalance from '../models/UserBalance.js';
import User from '../models/User.js'; // Ensure User model is imported
import Listing from '../models/Listing.js'; // Ensure Listing model is imported
import SellerOrder from '../models/SellerOrders.js'; // Ensure SellerOrders model is imported

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
    const checkouts = await CheckoutSubmission.find({ status, userId }) // Filter by userId and status
      .populate('userId', 'first_name last_name email')
      .populate({
        path: 'listingId',
        select: 'productName userId',
        populate: { path: 'userId', select: 'first_name last_name email' },
      });
    return checkouts;
  } catch (error) {
    throw new Error('Error fetching checkouts by status: ' + error.message);
  }
};

// Update checkout status (Admin/User)
export const updateCheckoutStatus = async (req, res) => {
  try {
    const { status, approvalNote } = req.body;

    // Log the incoming request data
    console.log('Incoming Request Data:', { status, approvalNote, checkoutId: req.params.id });

    const checkout = await CheckoutSubmission.findById(req.params.id).populate('listingId');

    if (!checkout) {
      console.error('Checkout not found for ID:', req.params.id); // Debug: Log missing checkout
      return res.status(404).json({ message: 'Checkout not found.' });
    }
    if (!status) {
      console.error('Status is missing in the request body from checkoutcontroller.'); // Debug: Log missing status
      return res.status(400).json({ message: 'Status is required from checkoutcontroller.' });
    }

    console.log('Before Update:', checkout.status); // Debug: Log current status

    // Update checkout fields
    checkout.status = status;
    if (approvalNote) {
      checkout.approvalNote = approvalNote;
    }

    if (status === 'Approved') {
      checkout.approvedAt = new Date();
    }

    if (status === 'Success') {
      checkout.BuyerStatus = 'Received';

      // Update seller balance
      const sellerId = checkout.listingId.userId; // Seller ID from the listing
      console.log('Updating seller balance for sellerId:', sellerId); // Debug: Log sellerId

      const sellerBalance = await UserBalance.findOne({ userId: sellerId });

      if (!sellerBalance) {
        console.log('Seller balance not found, creating new record.'); // Debug
        await new UserBalance({
          userId: sellerId,
          sellerBalance: checkout.totalPrice,
          transactions: [
            { amount: checkout.totalPrice, type: 'credit', referenceId: checkout._id },
          ],
        }).save();
      } else {
        console.log('Existing seller balance found, updating balance.'); // Debug
        sellerBalance.sellerBalance += checkout.totalPrice;
        sellerBalance.transactions.push({
          amount: checkout.totalPrice,
          type: 'credit',
          referenceId: checkout._id,
        });
        await sellerBalance.save();
      }
    }

    await checkout.save();
    console.log('After Update:', checkout.status); // Debug: Log updated status
    console.log('Updated Checkout:', checkout); // Debug: Log full updated checkout object

    res.status(200).json({ message: 'Checkout status updated successfully.', checkout });
  } catch (error) {
    console.error('Error updating checkout:', error.message); // Debug: Log error
    res.status(500).json({ message: 'Failed to update checkout status.', error: error.message });
  }
};

// Fetch paginated checkouts
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
  try {
    const { id } = req.params;

    const checkout = await CheckoutSubmission.findById(id).populate('listingId');
    if (!checkout) {
      return res.status(404).json({ message: 'Checkout not found.' });
    }

    if (checkout.BuyerStatus === 'Received') {
      return res.status(400).json({ message: 'Order already marked as Received.' });
    }

    checkout.BuyerStatus = 'Received';
    checkout.status = 'Success';
    await checkout.save();

    const sellerId = checkout.listingId.userId;
    const sellerBalance = await UserBalance.findOne({ userId: sellerId });

    if (!sellerBalance) {
      await new UserBalance({
        userId: sellerId,
        sellerBalance: checkout.totalPrice,
        transactions: [{ amount: checkout.totalPrice, type: 'credit', referenceId: checkout._id }],
      }).save();
    } else {
      sellerBalance.sellerBalance += checkout.totalPrice;
      sellerBalance.transactions.push({
        amount: checkout.totalPrice,
        type: 'credit',
        referenceId: checkout._id,
      });
      await sellerBalance.save();
    }

    res.status(200).json({ message: 'Order marked as Received successfully.', checkout });
  } catch (error) {
    console.error('Error marking order as Received:', error.message);
    res.status(500).json({ message: 'Failed to mark order as Received.', error: error.message });
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