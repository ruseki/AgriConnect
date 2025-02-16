const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const someController = require('../controllers/someController');

router.get('/protected', auth, someController.someFunction);

module.exports = router;
