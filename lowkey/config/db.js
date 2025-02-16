const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connection is successful');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1); 
    }
};

module.exports = connectDB;
