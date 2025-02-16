const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const resetTokenSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        token: {
            type: String,
            required: true
        },
        hashedToken: {  
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 3600
        }
    },
    { timestamps: true }
);

resetTokenSchema.pre("save", async function (next) {
    if (this.isModified("token")) {
        const hash = await bcrypt.hash(this.token, 8);
        this.hashedToken = hash;  
    }
    next();
});

module.exports = mongoose.model('ResetToken', resetTokenSchema);
