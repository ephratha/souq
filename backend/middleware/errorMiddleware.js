const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  
  console.error('Error:', err);
  
  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = { status: 404, message };
  }
  
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const message = `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    error = { status: 400, message };
  }
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { status: 400, message };
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = { status: 401, message: 'Invalid token' };
  }
  
  if (err.name === 'TokenExpiredError') {
    error = { status: 401, message: 'Token expired' };
  }
  
  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    error = { status: 400, message: 'File too large' };
  }
  
  // Default error
  const statusCode = error.status || 500;
  const message = error.message || 'Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

module.exports = errorMiddleware;