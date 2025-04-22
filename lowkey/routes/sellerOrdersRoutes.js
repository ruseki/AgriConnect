import express from 'express';
import auth from '../middleware/auth.js';
import SellerOrder from '../models/SellerOrders.js';
import CheckoutSubmission from '../models/CheckoutSubmission.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const sellerId = req.userId;
    
    console.log('Fetching orders for Seller ID:', sellerId);

    const sellerOrders = await SellerOrder.find({ sellerId })
      .populate('listingId', 'productName quantity unit price')
      .lean();

    if (!sellerOrders || sellerOrders.length === 0) {
      console.log('No orders found for seller:', sellerId);
      return res.status(200).json({ orders: [] });
    }

    const listingIds = sellerOrders.map(order => order.listingId?._id).filter(Boolean);
    
    console.log('Found listing IDs:', listingIds);

    let checkoutQuery = { listingId: { $in: listingIds } };
    
    const checkoutSubmissions = await CheckoutSubmission.find(checkoutQuery)
      .populate('userId', 'first_name last_name email')
      .populate('listingId', 'productName quantity unit price')
      .lean();

    console.log(`Found ${checkoutSubmissions.length} checkout submissions`);
    console.log(checkoutSubmissions)
    
    const formattedOrders = checkoutSubmissions.map(submission => {
      return {
        _id: submission._id,
        buyerName: submission.userId ? `${submission.userId.first_name} ${submission.userId.last_name}` : 'Unknown',
        buyerEmail: submission.userId?.email || '',
        productName: submission.listingId?.productName || 'Unknown Product',
        quantity: submission.quantity,
        unit: submission.listingId?.unit || '',
        totalPrice: submission.totalPrice,
        status: submission.status,
        buyerStatus: submission.BuyerStatus,
        approvalNote: submission.approvalNote || '',
        submittedAt: submission.submittedAt,
        reviewedAt: submission.reviewedAt || null
      };
    });

    res.status(200).json({ orders: formattedOrders });
  } catch (error) {
    console.error('Error fetching seller orders:', error.message);
    res.status(500).json({ message: 'Error fetching seller orders', error: error.message });
  }
});

export default router;