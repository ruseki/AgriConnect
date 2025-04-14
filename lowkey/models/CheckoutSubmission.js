import mongoose from 'mongoose';

const CheckoutSubmissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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
    type: String, // URL or path to the uploaded image
    required: true,
  },
  status: {
    type: String, // Pending, Approved, Rejected
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
});

export default mongoose.model('CheckoutSubmission', CheckoutSubmissionSchema);