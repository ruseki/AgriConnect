// models/Listing.js

import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  identifier: {
    type: String,
    unique: true,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  condition: {
    type: String,
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    default: 'available', 
  },
  color: {
    type: String,
    enum: ['red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'white', 'black'], // Temporary
    default: 'white',
  },
  minimumOrder: {
    type: Number,
    required: false, 
  },
  listedDate: {
    type: Date,
    default: Date.now, 
  },
});

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
