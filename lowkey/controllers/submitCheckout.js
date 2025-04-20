/* submitCheckout.js */

export const submitCheckout = async (req, res) => {
  try {
    const { bank, referenceNumber } = req.body;

    const proofImage = req.file?.path;

    if (!proofImage) {
      return res.status(400).json({ message: 'Proof image is required.' });
    }

    const newSubmission = new CheckoutSubmission({
      userId: req.userId,
      bank,
      referenceNumber,
      proofImage, 
    });

    await newSubmission.save();

    res.status(201).json({ message: 'Checkout submitted successfully', submission: newSubmission });
  } catch (error) {
    console.error('Error submitting checkout:', error.message);
    res.status(500).json({ message: 'Failed to submit checkout proof' });
  }
};