const { validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: errors.array()
      });
    }
    next();
  };
};

// Common validation schemas
const commonValidations = {
  paginationRules: [
    {
      in: ['query'],
      name: 'page',
      optional: true,
      isInt: {
        options: { min: 1 },
        errorMessage: 'Page must be a positive integer'
      }
    },
    {
      in: ['query'],
      name: 'limit',
      optional: true,
      isInt: {
        options: { min: 1, max: 100 },
        errorMessage: 'Limit must be between 1 and 100'
      }
    }
  ],
  
  idRule: {
    in: ['params'],
    name: 'id',
    isMongoId: {
      errorMessage: 'Invalid ID format'
    }
  },

  dateRule: {
    in: ['body'],
    name: 'date',
    isISO8601: {
      errorMessage: 'Invalid date format. Use ISO 8601 format'
    }
  }
};

// Rate limiting middleware
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    }
  });
};

module.exports = {
  validate,
  commonValidations,
  createRateLimiter
}; 