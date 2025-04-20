//messageRoutes.js

import express from 'express';
import Message from '../models/Message.js'; 
import auth from '../middleware/auth.js'; 

const router = express.Router();

import User from '../models/User.js'; 

router.get('/:senderId/conversations', auth, async (req, res) => {
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
            { senderId: senderObjectId._id },
            { recipientId: senderObjectId._id },
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
        $project: {
          _id: 0,
          participantId: '$_id',
          latestMessage: 1,
        },
      },
    ]);

    res.status(200).json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error.message);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

router.get('/:senderId/:recipientId', auth, async (req, res) => {
  const { senderId, recipientId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        {
          senderId: new mongoose.Types.ObjectId(senderId),
          recipientId: new mongoose.Types.ObjectId(recipientId),
        },
        {
          senderId: new mongoose.Types.ObjectId(recipientId),
          recipientId: new mongoose.Types.ObjectId(senderId),
        },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

router.get('/:senderId/:recipientId', auth, async (req, res) => {
  const { senderId, recipientId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, recipientId },
        { senderId: recipientId, recipientId: senderId }, 
      ],
    }).sort({ timestamp: 1 }); 

    res.status(200).json(messages); 
  } catch (error) {
    console.error('Error fetching messages:', error.message);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});


router.post('/', auth, async (req, res) => {
  const { senderId, recipientId, content } = req.body;

  try {
    console.log('Incoming message data:', { senderId, recipientId, content }); 

    const newMessage = new Message({
      senderId: new mongoose.Types.ObjectId(senderId), 
      recipientId: new mongoose.Types.ObjectId(recipientId), 
      timestamp: new Date(),
    });

    await newMessage.save(); 

    res.status(201).json(newMessage); 
  } catch (error) {
    console.error('Error creating message:', error.message); 
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
