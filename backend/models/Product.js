const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    max: [9999999, 'Price is too high']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
    enum: {
      values: ['electronics', 'fashion', 'books', 'home', 'beauty', 'sports', 'other'],
      message: 'Invalid category'
    }
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  imagePath: {
    type: String,
    required: [true, 'Main image path is required']
  },
  telegramPostId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller ID is required']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  ratings: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  discount: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  discountedPrice: {
    type: Number,
    default: function() {
      return this.price * (1 - this.discount / 100);
    }
  },
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for optimized queries
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ sellerId: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ averageRating: -1 });

// Update discounted price when price or discount changes
productSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('discount')) {
    this.discountedPrice = this.price * (1 - this.discount / 100);
  }
  this.updatedAt = Date.now();
  next();
});

// Update average rating when new rating is added
productSchema.methods.updateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalReviews = 0;
  } else {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = sum / this.ratings.length;
    this.totalReviews = this.ratings.length;
  }
  return this.save();
};

// Check if product is in stock
productSchema.methods.isInStock = function(quantity = 1) {
  return this.isAvailable && this.stock >= quantity;
};

// Reduce stock when product is sold
productSchema.methods.reduceStock = async function(quantity) {
  if (!this.isInStock(quantity)) {
    throw new Error('Insufficient stock');
  }
  this.stock -= quantity;
  if (this.stock === 0) {
    this.isAvailable = false;
  }
  return await this.save();
};

// Increase stock (for returns or restocking)
productSchema.methods.increaseStock = async function(quantity) {
  this.stock += quantity;
  if (this.stock > 0 && !this.isAvailable) {
    this.isAvailable = true;
  }
  return await this.save();
};

// Static method to search products
productSchema.statics.searchProducts = function(searchTerm, filters = {}) {
  let query = {};
  
  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }
  
  if (filters.category) {
    query.category = filters.category;
  }
  
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = filters.minPrice;
    if (filters.maxPrice) query.price.$lte = filters.maxPrice;
  }
  
  if (filters.isAvailable !== undefined) {
    query.isAvailable = filters.isAvailable;
  }
  
  if (filters.sellerId) {
    query.sellerId = filters.sellerId;
  }
  
  let productsQuery = this.find(query);
  
  if (filters.sortBy) {
    const sortDirection = filters.sortOrder === 'desc' ? -1 : 1;
    productsQuery = productsQuery.sort({ [filters.sortBy]: sortDirection });
  } else {
    productsQuery = productsQuery.sort({ createdAt: -1 });
  }
  
  if (filters.limit) {
    productsQuery = productsQuery.limit(filters.limit);
  }
  
  if (filters.skip) {
    productsQuery = productsQuery.skip(filters.skip);
  }
  
  return productsQuery.populate('sellerId', 'name email');
};

// Virtual for formatted price (ETB currency)
productSchema.virtual('formattedPrice').get(function() {
  return `ETB ${this.price.toFixed(2)}`;
});

productSchema.virtual('formattedDiscountedPrice').get(function() {
  if (this.discount > 0) {
    return `ETB ${this.discountedPrice.toFixed(2)}`;
  }
  return null;
});

// Virtual for discount percentage display
productSchema.virtual('discountPercentage').get(function() {
  return this.discount > 0 ? `${this.discount}% OFF` : null;
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;