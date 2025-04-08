/* Inventory.js*/

const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  productName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  expirationDate: { type: Date },
  cropType: { type: String }, // Added for farming-specific crops
  equipment: { type: [String] }, // Array for farming tools or machines
  plantingDate: { type: Date }, // Added for tracking crop planting
  harvestingDate: { type: Date }, // Added for tracking crop harvesting
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Inventory', InventorySchema);