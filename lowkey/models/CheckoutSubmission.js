import mongoose from 'mongoose';

const CheckoutSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true,
  },
  quantity: {
    type: Number, // Ensure quantity is defined
    required: true, // Make it required
  },
  totalPrice: {
    type: Number, // Ensure totalPrice is defined
    required: true, // Make it required
  },
  bank: {
    type: String,
    required: true,
  },
  referenceNumber: {
    type: String,
    required: true,
  },
  proofImage: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Success'],
    default: 'Pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  reviewedAt: {
    type: Date,
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  approvalNote: {
    type: String,
    default: '',
  },
});

export default mongoose.model('CheckoutSubmission', CheckoutSubmissionSchema);