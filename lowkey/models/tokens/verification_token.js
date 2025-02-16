const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: True
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

    });

verificationTokenSchema.pre("save", async function (next) {
 if(this.isModified("token")) {
    const hash = await bcrypt.hash(this.token, 8);
    this.token = hash;
 }   
});

verificationTokenSchema.methods.compareToken = async function (token) {
    const result = await bcrypt.comapreSync(token, this.token);
    return result;
}

module.exports = mongoose.model('verificationToken', verificationTokenSchema);