//verification_token.js

const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    token: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      expires: 3060, // 51 minutes
      default: Date.now()
    }
  }
);

verificationTokenSchema.methods.compareToken = function (token) {
  console.log('Comparing tokens:', this.token, token); 
  return this.token === token;
};

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);
