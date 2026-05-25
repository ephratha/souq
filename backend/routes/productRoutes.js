const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, authorize, checkOwnership } = require('../middleware/authMiddleware');
const { uploadSingle, uploadMultiple } = require('../middleware/uploadMiddleware');
const { postProductToChannel, editProductPost } = require('../services/telegramBot');
const { body, validationResult } = require('express-validator');

// ==================== PRODUCT VALIDATION RULES ====================
const productValidationRules = () => {
  return [
    body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
    body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be 10-2000 characters'),
    body('price').isFloat({ min: 0, max: 9999999 }).withMessage('Price must be a positive number'),
    body('category').isIn(['electronics', 'fashion', 'books', 'home', 'beauty', 'sports', 'other']).withMessage('Invalid category'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
    body('discount').optional().isInt({ min: 0, max: 100 }).withMessage('Discount must be between 0-100')
  ];
};

// ==================== PUBLIC ROUTES ====================

// Get all products with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      minPrice, 
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const filters = {
      isActive: true,
      isAvailable: true
    };
    
    if (category) filters.category = category;
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseFloat(minPrice);
      if (maxPrice) filters.price.$lte = parseFloat(maxPrice);
    }
    
    let query = Product.find(filters);
    
    // Search functionality
    if (search) {
      query = Product.find({ 
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ],
        ...filters
      });
    }
    
    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    query = query.sort(sortOptions);
    
    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    query = query.skip(skip).limit(limitNum);
    
    // Populate seller info
    query = query.populate('sellerId', 'name email');
    
    const products = await query;
    const total = await Product.countDocuments(filters);
    
    res.status(200).json({
      status: 'success',
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get single product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('sellerId', 'name email phoneNumber')
      .populate('ratings.userId', 'name');
    
    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }
    
    // Increment view count
    product.views += 1;
    await product.save();
    
    res.status(200).json({
      status: 'success',
      data: product
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Search products
router.get('/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const products = await Product.searchProducts(searchTerm, {
      isAvailable: true,
      isActive: true,
      limit: 20
    });
    
    res.status(200).json({
      status: 'success',
      data: products,
      count: products.length
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    const products = await Product.find({ 
      category, 
      isActive: true, 
      isAvailable: true 
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('sellerId', 'name');
    
    const total = await Product.countDocuments({ category, isActive: true });
    
    res.status(200).json({
      status: 'success',
      data: products,
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

// ==================== PROTECTED ROUTES (Seller/Admin only) ====================

// Create new product (Sellers only)
router.post('/', 
  protect, 
  authorize('seller', 'admin'),
  uploadMultiple('images', 5),
  productValidationRules(),
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          status: 'error',
          errors: errors.array()
        });
      }
      
      // Process uploaded images
      const images = [];
      let imagePath = null;
      
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          const imageUrl = `/uploads/${file.filename}`;
          images.push(imageUrl);
          if (!imagePath) imagePath = imageUrl;
        });
      }
      
      // Create product
      const productData = {
        ...req.body,
        sellerId: req.user._id,
        images,
        imagePath: imagePath || req.body.imagePath,
        price: parseFloat(req.body.price),
        stock: parseInt(req.body.stock) || 0,
        discount: parseInt(req.body.discount) || 0
      };
      
      const product = await Product.create(productData);
      
      // Post to Telegram channel (don't await - do in background)
      postProductToChannel(product, images).catch(err => {
        console.error('Telegram post error:', err);
      });
      
      // Populate seller info
      await product.populate('sellerId', 'name email');
      
      res.status(201).json({
        status: 'success',
        message: 'Product created successfully',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Update product (Owner or Admin only)
router.put('/:id',
  protect,
  checkOwnership(Product, 'id'),
  uploadMultiple('images', 5),
  async (req, res) => {
    try {
      let product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      // Process new images
      let images = product.images;
      let imagePath = product.imagePath;
      
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => `/uploads/${file.filename}`);
        images = [...images, ...newImages];
        if (!imagePath) imagePath = newImages[0];
      }
      
      // Update product
      const updateData = {
        ...req.body,
        images,
        imagePath,
        updatedAt: Date.now()
      };
      
      if (req.body.price) updateData.price = parseFloat(req.body.price);
      if (req.body.stock) updateData.stock = parseInt(req.body.stock);
      if (req.body.discount) updateData.discount = parseInt(req.body.discount);
      
      product = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      );
      
      // Update Telegram post if exists
      if (product.telegramPostId) {
        editProductPost(product, images).catch(err => {
          console.error('Telegram edit error:', err);
        });
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Product updated successfully',
        data: product
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Delete product (Owner or Admin only)
router.delete('/:id',
  protect,
  checkOwnership(Product, 'id'),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      // Soft delete
      product.isActive = false;
      await product.save();
      
      res.status(200).json({
        status: 'success',
        message: 'Product deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Add product rating (Authenticated users)
router.post('/:id/rate',
  protect,
  async (req, res) => {
    try {
      const { rating, comment } = req.body;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          status: 'error',
          message: 'Rating must be between 1 and 5'
        });
      }
      
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      // Check if user already rated
      const existingRating = product.ratings.find(
        r => r.userId.toString() === req.user._id.toString()
      );
      
      if (existingRating) {
        existingRating.rating = rating;
        existingRating.comment = comment;
        existingRating.createdAt = Date.now();
      } else {
        product.ratings.push({
          userId: req.user._id,
          rating,
          comment
        });
      }
      
      // Update average rating
      await product.updateAverageRating();
      
      res.status(200).json({
        status: 'success',
        message: 'Rating added successfully',
        data: {
          averageRating: product.averageRating,
          totalReviews: product.totalReviews
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }
);

// Update product stock (Seller/Admin)
router.patch('/:id/stock',
  protect,
  checkOwnership(Product, 'id'),
  async (req, res) => {
    try {
      const { quantity, operation = 'set' } = req.body;
      
      const product = await Product.findById(req.params.id);
      
      if (!product) {
        return res.status(404).json({
          status: 'error',
          message: 'Product not found'
        });
      }
      
      if (operation === 'increase') {
        await product.increaseStock(quantity);
      } else if (operation === 'decrease') {
        await product.reduceStock(quantity);
      } else {
        product.stock = quantity;
        product.isAvailable = quantity > 0;
        await product.save();
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Stock updated successfully',
        data: {
          stock: product.stock,
          isAvailable: product.isAvailable
        }
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