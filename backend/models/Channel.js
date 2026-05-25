const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Channel name is required'],
    trim: true,
    minlength: [3, 'Channel name must be at least 3 characters'],
    maxlength: [100, 'Channel name cannot exceed 100 characters'],
    unique: true
  },
  description: {
    type: String,
    required: [true, 'Channel description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  telegramLink: {
    type: String,
    required: [true, 'Telegram channel link is required'],
    trim: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Validate Telegram link format
        return /^(https?:\/\/)?(t\.me|telegram\.me)\/[a-zA-Z0-9_]+$/.test(v) || 
               /^@[a-zA-Z0-9_]+$/.test(v) ||
               /^-?\d+$/.test(v); // Chat ID (numeric)
      },
      message: 'Invalid Telegram channel link. Use format: @username, https://t.me/username, or chat ID'
    }
  },
  chatId: {
    type: String,
    required: [true, 'Telegram Chat ID is required'],
    unique: true,
    trim: true,
    description: 'Extracted from telegramLink for API calls'
  },
  category: {
    type: String,
    required: [true, 'Channel category is required'],
    enum: {
      values: ['electronics', 'fashion', 'books', 'home', 'beauty', 'sports', 'general', 'other'],
      message: 'Invalid category'
    },
    default: 'general'
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Channel owner is required']
  },
  logoPath: {
    type: String,
    default: null
  },
  coverImagePath: {
    type: String,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false,
    description: 'Whether the channel is verified by admin'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  memberCount: {
    type: Number,
    default: 0,
    min: 0
  },
  productCount: {
    type: Number,
    default: 0
  },
  settings: {
    autoPost: {
      type: Boolean,
      default: true,
      description: 'Automatically post products to channel'
    },
    requireApproval: {
      type: Boolean,
      default: false,
      description: 'Require admin approval before posting'
    },
    postFormat: {
      type: String,
      enum: ['standard', 'detailed', 'minimal'],
      default: 'standard'
    },
    includeSellerInfo: {
      type: Boolean,
      default: true
    }
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
channelSchema.index({ name: 1 });
channelSchema.index({ ownerId: 1 });
channelSchema.index({ category: 1 });
channelSchema.index({ chatId: 1 });
channelSchema.index({ isActive: 1, isVerified: 1 });
channelSchema.index({ productCount: -1 });
channelSchema.index({ memberCount: -1 });

// Extract chat ID from various Telegram link formats
channelSchema.pre('save', function(next) {
  try {
    let link = this.telegramLink.trim();
    
    // Extract chat ID from different formats
    if (link.match(/^-?\d+$/)) {
      // Already a numeric chat ID
      this.chatId = link;
    } else if (link.startsWith('@')) {
      // Username format
      this.chatId = link;
    } else {
      // URL format - extract username
      const match = link.match(/(?:t\.me|telegram\.me)\/([a-zA-Z0-9_]+)/);
      if (match) {
        this.chatId = `@${match[1]}`;
      } else {
        throw new Error('Could not extract chat ID from Telegram link');
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Update product count
channelSchema.methods.updateProductCount = async function() {
  const Product = mongoose.model('Product');
  const count = await Product.countDocuments({ 
    channelId: this._id,
    isActive: true 
  });
  this.productCount = count;
  return await this.save();
};

// Increment product count
channelSchema.methods.incrementProductCount = async function() {
  this.productCount += 1;
  return await this.save();
};

// Decrement product count
channelSchema.methods.decrementProductCount = async function() {
  if (this.productCount > 0) {
    this.productCount -= 1;
  }
  return await this.save();
};

// Get formatted Telegram link for display
channelSchema.virtual('formattedTelegramLink').get(function() {
  if (this.telegramLink.startsWith('http')) {
    return this.telegramLink;
  } else if (this.telegramLink.startsWith('@')) {
    return `https://t.me/${this.telegramLink.substring(1)}`;
  } else if (this.telegramLink.match(/^-?\d+$/)) {
    return `https://t.me/c/${this.telegramLink}`;
  }
  return this.telegramLink;
});

// Get display name (without @ symbol)
channelSchema.virtual('displayName').get(function() {
  if (this.name) return this.name;
  if (this.chatId) return this.chatId.replace('@', '');
  return 'Unknown Channel';
});

// Static method to get channels by owner
channelSchema.statics.findByOwner = function(ownerId) {
  return this.find({ ownerId, isActive: true }).sort({ createdAt: -1 });
};

// Static method to get popular channels
channelSchema.statics.getPopularChannels = function(limit = 10) {
  return this.find({ isActive: true, isVerified: true })
    .sort({ productCount: -1, memberCount: -1 })
    .limit(limit)
    .populate('ownerId', 'name email');
};

const Channel = mongoose.model('Channel', channelSchema);

module.exports = Channel;