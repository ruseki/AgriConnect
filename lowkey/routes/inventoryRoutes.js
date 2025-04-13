import express from 'express';
import auth from '../middleware/auth.js'; // Middleware to protect routes
import Inventory from '../models/Inventory.js';

const router = express.Router();

// Create a new inventory item
router.post('/', auth, async (req, res) => {
  try {
    const { productName, category, quantity, unit, price, expirationDate } = req.body;

    const newInventory = new Inventory({
      productName,
      category,
      quantity,
      unit,
      price,
      expirationDate,
      sellerId: req.userId, // Seller is the logged-in user
    });

    await newInventory.save();
    res.status(201).json({ message: 'Inventory item created successfully', inventory: newInventory });
  } catch (error) {
    console.error('Error creating inventory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Fetch all inventory items for the logged-in seller
router.get('/', auth, async (req, res) => {
  try {
    const inventoryItems = await Inventory.find({ sellerId: req.userId });
    res.status(200).json({ inventoryItems });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update an inventory item
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, category, quantity, unit, price, expirationDate } = req.body;

    const updatedInventory = await Inventory.findByIdAndUpdate(
      id,
      { productName, category, quantity, unit, price, expirationDate },
      { new: true } // Return updated item
    );

    if (!updatedInventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.status(200).json({ message: 'Inventory item updated successfully', inventory: updatedInventory });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete an inventory item
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInventory = await Inventory.findByIdAndDelete(id);

    if (!deletedInventory) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    res.status(200).json({ message: 'Inventory item deleted successfully' });
  } catch (error) {
    console.error('Error deleting inventory:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
