import Message from '../models/Message.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const getConversations = async (req, res) => {
  const { senderId } = req.params;

  try {
    const senderObjectId = await User.findOne({ userId: senderId }).select('_id'); 
    if (!senderObjectId) {
      return res.status(404).json({ error: 'User not found' });
    }

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(senderId) },
            { recipientId: new mongoose.Types.ObjectId(senderId) },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$senderId', senderObjectId._id] },
              '$recipientId',
              '$senderId',
            ],
          },
          latestMessage: { $last: '$$ROOT' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'participantDetails',
        },
      },
      {
        $project: {
          _id: 0,
          participantId: '$_id',
          latestMessage: 1,
          participantDetails: { $arrayElemAt: ['$participantDetails', 0] },
        },
      },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error.message);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
};

export const getMessages = async (req, res) => {
  const { senderId, recipientId } = req.params;

  console.log("Raw senderId:", senderId);
  console.log("Raw recipientId:", recipientId);

  try {
    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

    console.log("Converted senderId (ObjectId):", senderObjectId);
    console.log("Converted recipientId (ObjectId):", recipientObjectId);

    const messages = await Message.find({
      $or: [
        { senderId: senderObjectId, recipientId: recipientObjectId },
        { senderId: recipientObjectId, recipientId: senderObjectId },
      ],
    }).sort({ timestamp: 1 });

    console.log("Fetched messages:", messages);
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  const { senderId, recipientId, content } = req.body;

  try {
    const senderObjectId = new mongoose.Types.ObjectId(senderId);
    const recipientObjectId = new mongoose.Types.ObjectId(recipientId);

    const newMessage = new Message({
      senderId: senderObjectId,
      recipientId: recipientObjectId,
      content,
      timestamp: new Date(),
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error creating message:', error.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
};