const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');

// Create Order
router.post('/', protect, async (req, res) => {
  try {
    const { products, totalAmount, shippingAddress, phoneNumber } = req.body;
    const newOrder = new Order({
      buyerId: req.user.id,
      products,
      totalAmount,
      shippingAddress,
      phoneNumber
    });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get User Orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id }).populate('products.productId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update Order Status (Admin/Seller)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    if (req.user.role === 'buyer') return res.status(403).json({ message: 'Unauthorized' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;