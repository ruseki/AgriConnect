import express from 'express';
import auth from '../middleware/auth.js';
import { getConversations, getMessages, sendMessage } from '../controllers/messageController.js';
import { searchUsers } from '../controllers/userController.js';

const router = express.Router();

router.get('/:senderId/conversations', auth, getConversations);
router.get('/:senderId/:recipientId', auth, getMessages);

router.post('/', auth, sendMessage);


// Add a search route
/*router.get('/search/:query', auth, searchUsers);*/
router.get('/users/search/:query', auth, searchUsers);

export default router;