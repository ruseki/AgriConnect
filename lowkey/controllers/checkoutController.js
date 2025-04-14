import CheckoutSubmission from '../models/CheckoutSubmission.js';

// Submit a checkout (User)
export const submitCheckout = async (req, res) => {
  try {
    const { bank, referenceNumber } = req.body;
    const proofImage = req.file?.path; // Path to the uploaded image

    if (!proofImage) {
      return res.status(400).json({ message: 'Proof image is required.' });
    }

    const newCheckout = new CheckoutSubmission({
      userId: req.userId, // Ensure `auth` middleware populates `req.userId`
      bank,
      referenceNumber,
      proofImage,
    });

    await newCheckout.save();

    res.status(201).json({ message: 'Payment details submitted successfully', checkout: newCheckout });
  } catch (error) {
    console.error('Error submitting payment:', error.message);
    res.status(500).json({ message: 'Failed to submit payment details' });
  }
};

// Get all checkouts (Admin)
export const getAllCheckouts = async (req, res) => {
  try {
    const checkouts = await CheckoutSubmission.find()
      .populate('userId', 'first_name last_name email') // Populate user information
      .populate('listingId', 'listingId sellerName'); // Populate listingId and sellerName

    res.status(200).json({ checkouts });
  } catch (error) {
    console.error('Error fetching checkouts:', error.message);
    res.status(500).json({ message: 'Failed to fetch checkouts' });
  }
};

// Update checkout status (Admin)
export const updateCheckoutStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedCheckout = await CheckoutSubmission.findByIdAndUpdate(
      id,
      { status, reviewedBy: req.userId, reviewedAt: new Date() },
      { new: true }
    );

    if (!updatedCheckout) {
      return res.status(404).json({ message: 'Checkout submission not found' });
    }

    res.status(200).json({ message: 'Checkout updated successfully', checkout: updatedCheckout });
  } catch (error) {
    console.error('Error updating checkout:', error.message);
    res.status(500).json({ message: 'Failed to update checkout' });
  }
};