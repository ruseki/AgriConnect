/* withdrawalRoutes.js */

import express from 'express';
import Withdrawal from '../models/Withdrawal.js';
import authMiddleware from '../middleware/auth.js';// Add this to withdrawalRoutes.js
import UserBalance from '../models/UserBalance.js';



const router = express.Router();

// Record a withdrawal
router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const { amount, method, accountNumber, accountName } = req.body;
    const commission = amount * 0.01; // 1% commission
    const totalDeduction = amount + commission; // Total amount to deduct
    const { userId } = req.user;

    // Validate required fields
    if (!userId || !amount || !method || !accountNumber || !accountName) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Fetch the user's balance
    const userBalance = await UserBalance.findOne({ userId });

    if (!userBalance || userBalance.sellerBalance < totalDeduction) {
      return res.status(400).json({ message: 'Insufficient balance for withdrawal.' });
    }

    // Deduct the total amount from sellerBalance
    userBalance.sellerBalance -= totalDeduction;

    // Add a new transaction (debit) to the transactions array
    userBalance.transactions.push({
      amount: -totalDeduction,
      type: 'debit',
      referenceId: new Date().toISOString(), // Can be a timestamp or unique ID
    });

    // Save updated balance
    await userBalance.save();

    // Record the withdrawal in the `Withdrawal` model
    const newWithdrawal = new Withdrawal({
      userId,
      amount,
      method,
      accountNumber,
      accountName,
      commission,
      date: new Date(),
    });

    await newWithdrawal.save();

    // Debugging logs
    console.log('User ID:', userId);
    console.log('User Balance Before:', userBalance.sellerBalance + totalDeduction); // Log original balance
    console.log('Total Deduction:', totalDeduction);
    console.log('Transactions:', userBalance.transactions);
    console.log('Withdrawal Recorded:', newWithdrawal);

    res.status(200).json({ message: 'Withdrawal recorded successfully.' });
  } catch (error) {
    console.error('Error recording withdrawal:', error.message);
    res.status(500).json({ message: 'Failed to record withdrawal.' });
  }
});

// Fetch withdrawal history
router.get('/withdraw-history', authMiddleware, async (req, res) => {
  try {
    console.log('Incoming request to /withdraw-history:', req.userId); // Ensure req.userId exists
    const history = await Withdrawal.find({ userId: req.userId }).sort({ date: -1 });
    res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching withdrawal history:', error.message);
    res.status(500).json({ message: 'Failed to fetch withdrawal history.' });
  }
});

// Fetch balance for a user
router.get('/balance', authMiddleware, async (req, res) => {
  try {
    console.log('req.userId:', req.userId); // Log the user ID from req.userId

    const userBalance = await UserBalance.findOne({ userId: req.userId }); // Query the database using req.userId
    if (!userBalance) {
      console.log(`No UserBalance found for userId: ${req.userId}`); // Log missing balance
      return res.status(404).json({ message: 'Balance not found.' });
    }

    console.log('UserBalance fetched:', userBalance); // Log fetched balance
    res.status(200).json({ sellerBalance: userBalance.sellerBalance });
  } catch (error) {
    console.error('Error fetching balance:', error.message);
    res.status(500).json({ message: 'Failed to fetch balance.' });
  }
});

export default router;