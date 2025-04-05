const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  productName: { type: String, required: true }, // Name of the product
  category: { type: String, required: true }, // Product category
  quantity: { type: Number, required: true }, // Stock quantity
  unit: { type: String, required: true }, // Unit of measurement (e.g., kilograms, sacks)
  price: { type: Number, required: true }, // Price per unit
  expirationDate: { type: Date }, // Optional for perishables
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
}, { timestamps: true }); // Auto timestamps

module.exports = mongoose.model('Inventory', InventorySchema);