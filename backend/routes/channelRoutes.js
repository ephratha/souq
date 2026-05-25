const express = require('express');
const router = express.Router();
const Channel = require('../models/Channel');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/authMiddleware');
const { uploadSingle } = require('../middleware/uploadMiddleware');
const { body, validationResult } = require('express-validator');

// ==================== VALIDATION RULES ====================
const channelValidationRules = () => {
  return [
    body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
    body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
    body('telegramLink').trim().notEmpty().withMessage('Telegram link is required'),
    body('category').isIn(['electronics', 'fashion', 'books', 'home', 'beauty', 'sports', 'general', 'other']).withMessage('Invalid category')
  ];
};

// ==================== PUBLIC ROUTES ====================

// Get all active channels
router.get('/', async (req, res) => {
  try {
    const { category, limit = 20, page = 1, sortBy = 'productCount' } = req.query;
    
    const query = { isActive: true };
    if (category) query.category = category;
    
    const channels = await Channel.find(query)
      .sort({ [sortBy]: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('ownerId', 'name email');
    
    const total = await Channel.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      data: channels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get single channel by ID
router.get('/:id', async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id)
      .populate('ownerId', 'name email phoneNumber');
    
    if (!channel) {
      return res.status(404).json({
        status: 'error',
        message: 'Channel not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: channel
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get products in a specific channel
router.get('/:id/products', async (req, res) => {
  try {
    const { limit = 20, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const channel = await Channel.findById(req.params.id);
    if (!channel) {
      return res.status(404).json({
        status: 'error',
        message: 'Channel not found'
      });
    }
    
    const products = await Product.findByChannel(req.params.id, {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sortBy,
      sortOrder
    });
    
    const total = await Product.countDocuments({ channelId: req.params.id, isActive: true });
    
    res.status(200).json({
      status: 'success',
      data: {
        channel: channel.name,
        products
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get popular channels
router.get('/popular/top', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const channels = await Channel.getPopularChannels(parseInt(limit));
    
    res.status(200).json({
      status: 'success',
      data: channels
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// ==================== PROTECTED ROUTES ====================

// Create new channel (Sellers and Admins)
router.post('/',
  protect,
  authorize('seller', 'admin'),
  uploadSingle('logo'),
  channelValidationRules(),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }
      
      // Check if user already owns a channel with same name
      const existingChannel = await Channel.findOne({ 
        name: req.body.name,
        ownerId: req.user._id 
      });
      
      if (existingChannel) {
        return res.status(400).json({
          status: 'error',
          message: 'You already own a channel with this name'
        });
      }
      
      // Check if telegram link is already used
      const existingTelegram = await Channel.findOne({ 
        telegramLink: req.body.telegramLink 
      });
      
      if (existingTelegram) {
        return res.status(400).json({
          status: 'error',
          message: 'This Telegram channel is already registered'
        });
      }
      
      const channelData = {
        ...req.body,
        ownerId: req.user._id,
        logoPath: req.file ? `/uploads/${req.file.filename}` : null
      };
      
      const channel = await Channel.create(channelData);
      await channel.populate('ownerId', 'name email');
      
      res.status(201).json({
        status: 'success',
        message: 'Channel created successfully',
        data: channel
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Update channel (Owner or Admin only)
router.put('/:id',
  protect,
  uploadSingle('logo'),
  async (req, res) => {
    try {
      let channel = await Channel.findById(req.params.id);
      
      if (!channel) {
        return res.status(404).json({
          status: 'error',
          message: 'Channel not found'
        });
      }
      
      // Check ownership
      if (channel.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to update this channel'
        });
      }
      
      const updateData = {
        ...req.body,
        updatedAt: Date.now()
      };
      
      if (req.file) {
        updateData.logoPath = `/uploads/${req.file.filename}`;
      }
      
      channel = await Channel.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate('ownerId', 'name email');
      
      res.status(200).json({
        status: 'success',
        message: 'Channel updated successfully',
        data: channel
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Delete channel (Owner or Admin only)
router.delete('/:id',
  protect,
  async (req, res) => {
    try {
      const channel = await Channel.findById(req.params.id);
      
      if (!channel) {
        return res.status(404).json({
          status: 'error',
          message: 'Channel not found'
        });
      }
      
      // Check ownership
      if (channel.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to delete this channel'
        });
      }
      
      // Check if channel has products
      const productCount = await Product.countDocuments({ channelId: channel._id });
      if (productCount > 0 && req.user.role !== 'admin') {
        return res.status(400).json({
          status: 'error',
          message: `Cannot delete channel with ${productCount} products. Remove products first or contact admin.`
        });
      }
      
      // Soft delete
      channel.isActive = false;
      await channel.save();
      
      // Optionally deactivate all products in this channel
      if (productCount > 0) {
        await Product.updateMany(
          { channelId: channel._id },
          { isActive: false }
        );
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Channel deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Get my channels (for authenticated seller)
router.get('/my/channels',
  protect,
  authorize('seller', 'admin'),
  async (req, res) => {
    try {
      const channels = await Channel.findByOwner(req.user._id);
      
      res.status(200).json({
        status: 'success',
        data: channels,
        count: channels.length
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Update channel settings
router.patch('/:id/settings',
  protect,
  async (req, res) => {
    try {
      const channel = await Channel.findById(req.params.id);
      
      if (!channel) {
        return res.status(404).json({
          status: 'error',
          message: 'Channel not found'
        });
      }
      
      if (channel.ownerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized'
        });
      }
      
      const { autoPost, requireApproval, postFormat, includeSellerInfo } = req.body;
      
      channel.settings = {
        ...channel.settings,
        autoPost: autoPost !== undefined ? autoPost : channel.settings.autoPost,
        requireApproval: requireApproval !== undefined ? requireApproval : channel.settings.requireApproval,
        postFormat: postFormat || channel.settings.postFormat,
        includeSellerInfo: includeSellerInfo !== undefined ? includeSellerInfo : channel.settings.includeSellerInfo
      };
      
      await channel.save();
      
      res.status(200).json({
        status: 'success',
        message: 'Channel settings updated',
        data: channel.settings
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

module.exports = router;