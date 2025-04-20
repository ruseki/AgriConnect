// Inventory.js

import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  productName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  expirationDate: { type: Date },
  cropType: { type: String }, 
  equipment: { type: [String] }, 
  plantingDate: { type: Date },
  harvestingDate: { type: Date }, 
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', InventorySchema);
export default Inventory;
