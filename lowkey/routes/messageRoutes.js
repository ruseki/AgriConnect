const express = require('express');
const router = express.Router();
const Message = require('../models/Message'); // Message model
const auth = require('../middleware/auth'); // Middleware for authorization

// Fetch all conversations for a specific sender (list of chats for the left division)
router.get('/:senderId/conversations', auth, async (req, res) => {
  const { senderId } = req.params;

  try {
    // Group by recipientId and fetch the latest message for each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ senderId }, { recipientId: senderId }], // Match messages where user is sender or recipient
        },
      },
      {
        $group: {
          _id: { $cond: [{ $eq: ['$senderId', senderId] }, '$recipientId', '$senderId'] }, // Dynamically determine the other user
          latestMessage: { $last: '$$ROOT' }, // Get the latest message for each conversation
        },
      },
      {
        $project: {
          _id: 0,
          participantId: '$_id',
          latestMessage: 1,
        },
      },
    ]);

    res.status(200).json(conversations); // Return all conversations
  } catch (error) {
    console.error('Error fetching conversations:', error.message);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Fetch all messages between sender and recipient (right side chatbox)
router.get('/:senderId/:recipientId', auth, async (req, res) => {
  const { senderId, recipientId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, recipientId },
        { senderId: recipientId, recipientId: senderId }, // Match both sender-recipient combinations
      ],
    }).sort({ timestamp: 1 }); // Sort messages by timestamp

    res.status(200).json(messages); // Return all messages
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send a new message
router.post('/', auth, async (req, res) => {
  const { senderId, recipientId, content } = req.body;

  try {
    const newMessage = new Message({
      senderId,
      recipientId,
      content,
      timestamp: new Date(), // Add timestamp for sorting
    });

    await newMessage.save(); // Save the message to the database

    res.status(201).json(newMessage); // Return the newly created message
  } catch (error) {
    console.error('Error sending message:', error.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;