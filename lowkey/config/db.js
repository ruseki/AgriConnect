import mongoose from 'mongoose';
import dotenv from 'dotenv'; // Import dotenv

dotenv.config(); // Load environment variables from .env file

const connectDB = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not defined in the .env file.");
        }
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connection is successful');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
        process.exit(1);  // Exit the process with failure code
    }
};

export default connectDB;
