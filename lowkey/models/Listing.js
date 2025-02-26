//Listing.js

import mongoose from 'mongoose';

function generateIdentifier() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let identifier = '';

  for (let i = 0; i < 3; i++) {
    identifier += letters[Math.floor(Math.random() * letters.length)];
  }

  for (let i = 0; i < 9; i++) {
    identifier += numbers[Math.floor(Math.random() * numbers.length)];
  }

  return identifier;
}

const listingSchema = new mongoose.Schema({
  identifier: {
    type: String,
    unique: true,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  userId: {  
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  
    required: true
  }
});

listingSchema.pre('save', async function (next) {
  if (!this.identifier) {
    this.identifier = await genUniqIden(this.constructor);  
  }
  next();
});

export async function genUniqIden(Listing) {
  let identifier;
  let exists = true;

  while (exists) {
    identifier = generateIdentifier();
    console.log('Generated identifier:', identifier);  

    exists = await Listing.exists({ identifier });
    console.log('Identifier already exists?:', exists !== null ? 'Yes' : 'No');
  }

  return identifier;
}

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;
