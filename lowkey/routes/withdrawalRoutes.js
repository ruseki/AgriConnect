/* withdrawalRoutes.js */

import express from 'express';
import Withdrawal from '../models/Withdrawal.js';
import authMiddleware from '../middleware/auth.js';
import UserBalance from '../models/UserBalance.js';



const router = express.Router();

router.post('/withdraw', authMiddleware, async (req, res) => {
  try {
    const { amount, method, accountNumber, accountName } = req.body;
    const commission = amount * 0.01; 
    const totalDeduction = amount + commission; 
    const { userId } = req.user;

    if (!userId || !amount || !method || !accountNumber || !accountName) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    const userBalance = await UserBalance.findOne({ userId });

    if (!userBalance || userBalance.sellerBalance < totalDeduction) {
      return res.status(400).json({ message: 'Insufficient balance for withdrawal.' });
    }

    userBalance.sellerBalance -= totalDeduction;

    userBalance.transactions.push({
      amount: -totalDeduction,
      type: 'debit',
      referenceId: new Date().toISOString(), 
    });

    await userBalance.save();

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

    console.log('User ID:', userId);
    console.log('User Balance Before:', userBalance.sellerBalance + totalDeduction); 
    console.log('Total Deduction:', totalDeduction);
    console.log('Transactions:', userBalance.transactions);
    console.log('Withdrawal Recorded:', newWithdrawal);

    res.status(200).json({ message: 'Withdrawal recorded successfully.' });
  } catch (error) {
    console.error('Error recording withdrawal:', error.message);
    res.status(500).json({ message: 'Failed to record withdrawal.' });
  }
});

router.get('/withdraw-history', authMiddleware, async (req, res) => {
  try {
    console.log('Incoming request to /withdraw-history:', req.userId); 
    const history = await Withdrawal.find({ userId: req.userId }).sort({ date: -1 });
    res.status(200).json({ history });
  } catch (error) {
    console.error('Error fetching withdrawal history:', error.message);
    res.status(500).json({ message: 'Failed to fetch withdrawal history.' });
  }
});

router.get('/balance', authMiddleware, async (req, res) => {
  try {
    console.log('req.userId:', req.userId); 

    const userBalance = await UserBalance.findOne({ userId: req.userId }); 
    if (!userBalance) {
      console.log(`No UserBalance found for userId: ${req.userId}`); 
      return res.status(404).json({ message: 'Balance not found.' });
    }

    console.log('UserBalance fetched:', userBalance); 
    res.status(200).json({ sellerBalance: userBalance.sellerBalance });
  } catch (error) {
    console.error('Error fetching balance:', error.message);
    res.status(500).json({ message: 'Failed to fetch balance.' });
  }
});

export default router;