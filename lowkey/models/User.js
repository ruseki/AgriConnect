const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
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
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const hash = await bcrypt.hash(this.password, 10);
        this.password = hash;
    }
    next();
});

module.exports = mongoose.model('User', UserSchema);
