const jwt = require('jsonwebtoken');
const Token = require('../models/tokens/login_state_token');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  
    console.log('Decoded Token:', decoded);
    const storedToken = await Token.findOne({ owner: decoded.userId, token });

    if (!storedToken) {
      throw new Error('Token not found');
    }

    const user = await User.findById(decoded.userId);  
    if (!user) {
      return res.status(401).json({ message: 'User not verified. Please verify your email.' });
    }

    req.user = { _id: user._id, email: user.email };  

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Please authenticate.' });
  }
};

module.exports = auth;
