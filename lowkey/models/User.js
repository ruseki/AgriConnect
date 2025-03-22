const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

function generateUserId() {
  const digits = '0123456789';
  let userId = '';
  for (let i = 0; i < 20; i++) {
    userId += digits[Math.floor(Math.random() * digits.length)];
  }
  return userId;
}

const UserSchema = new mongoose.Schema({
    userId: { type: String, unique: true, required: true },
    first_name: { type: String, required: true },
    middle_name: { type: String },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plain_text_password: { type: String, required: true },
    otp: { type: String },
    otpExpires: { type: Date },
    verificationCode: { type: String },
    isVerified: { type: Boolean, default: false },
    userType: { type: String, default: 'user' },
    isAdmin: { type: Boolean, default: false }, // New field to manage admin accounts
}, { timestamps: true });

UserSchema.pre('validate', async function (next) {
    if (this.isNew) {
        let uniqueId = generateUserId();
        let existingUser = await this.constructor.findOne({ userId: uniqueId });

        while (existingUser) {
            uniqueId = generateUserId();
            existingUser = await this.constructor.findOne({ userId: uniqueId });
        }
        this.userId = uniqueId; 
    }
    
    if (this.isModified('password')) {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
    }

    next(); 
});

module.exports = mongoose.model('User', UserSchema);