const jwt = require('jsonwebtoken');
const { User } = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;
  
  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token (exclude password)
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }
      
      if (!user.isActive) {
        return res.status(401).json({
          status: 'error',
          message: 'Account is deactivated'
        });
      }
      
      // Attach user to request
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(401).json({
        status: 'error',
        message: 'Not authorized, invalid token'
      });
    }
  }
  
  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Not authorized, no token provided'
    });
  }
};

// Authorize based on roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: `Role ${req.user.role} is not authorized to access this resource`
      });
    }
    next();
  };
};

// Check if user owns resource or is admin
const checkOwnership = (resourceModel, resourceIdField = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdField];
      const resource = await resourceModel.findById(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          status: 'error',
          message: 'Resource not found'
        });
      }
      
      // Check if user is the owner or admin
      if (resource.sellerId && resource.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          status: 'error',
          message: 'Not authorized to modify this resource'
        });
      }
      
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { protect, authorize, checkOwnership };