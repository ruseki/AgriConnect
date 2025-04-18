/* UserBalance.js */

import mongoose from 'mongoose';

const UserBalanceSchema = new mongoose.Schema({
  userId: { type: String, ref: 'User', required: true }, // Consistent with User.js's userId as a String
  sellerBalance: { type: Number, default: 0 }, // Default balance is 0
  transactions: [
    {
      amount: Number,
      type: { type: String, enum: ['credit', 'debit'] }, // Transaction type
      timestamp: { type: Date, default: Date.now }, // Date of transaction
      referenceId: String, // Optional reference for transaction (e.g., order ID)
    },
  ],
});

const UserBalance = mongoose.model('UserBalance', UserBalanceSchema);
export default UserBalance;