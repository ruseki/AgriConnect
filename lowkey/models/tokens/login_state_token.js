//login_state_token.js

const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 3600 }, 
});


module.exports = mongoose.model('Token', TokenSchema);
