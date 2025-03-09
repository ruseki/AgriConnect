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
      expire: 3060,
      default: Date.now()
    }
  }
);

verificationTokenSchema.methods.compareToken = function (token) {
  return this.token === token;  
}

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);
