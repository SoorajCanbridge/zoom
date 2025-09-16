const { logger } = require('../config/logger');

// Custom error class
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Main error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error('Error:', {
    error: err,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    body: req.body,
    user: req.user ? req.user._id : 'unauthenticated'
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => error.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `Duplicate field: ${field}. Please use another value.`
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token. Please log in again.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired. Please log in again.'
    });
  }

  // Production vs Development error response
  if (process.env.NODE_ENV === 'production') {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    }
    // Programming or unknown errors: don't leak error details
    return res.status(500).json({
      success: false,
      message: 'Something went wrong'
    });
  }

  // Development error response
  return res.status(err.statusCode).json({
    success: false,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

module.exports = { AppError, errorHandler }; 