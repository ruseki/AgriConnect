// cartController.js

import Cart from '../models/Cart.js';
import Listing from '../models/Listing.js'; 

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.userId }).populate('items.productId');
    if (!cart) {
      return res.status(200).json({ cartItems: [] });
    }

    const cartItems = cart.items.map(item => {
      if (!item.productId) {

        return {
          ...item.toObject(),
          productId: null,
          productName: 'Deleted Product', 
        };
      }
      return {
        ...item.toObject(),
        productName: item.productId.productName, 
      };
    });

    res.status(200).json({ cartItems });
  } catch (error) {
    console.error('Error fetching cart items:', error.message);
    res.status(500).json({ message: 'Error fetching cart items.' });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity } = req.body;

    const listing = await Listing.findById(productId); 
    if (!listing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find((item) => item.productId.equals(productId));
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {

      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cartItems: cart.items });
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    res.status(500).json({ message: 'Error adding to cart', error: error.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => !item.productId || item.productId.equals(productId));
    await cart.save();

    res.status(200).json({ message: 'Item removed from cart', cartItems: cart.items });
  } catch (error) {
    console.error('Error removing from cart:', error.message);
    res.status(500).json({ message: 'Error removing from cart', error: error.message });
  }
};
