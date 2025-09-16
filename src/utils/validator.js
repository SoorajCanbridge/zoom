const { validationResult } = require('express-validator');
const ApiResponse = require('./apiResponse');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(
      ApiResponse.error(
        'Validation failed',
        400,
        errors.array()
      )
    );
  }
  next();
};

const validationRules = {
  user: {
    create: [
      // User validation rules
    ],
    update: [
      // Update validation rules
    ]
  },
  meeting: {
    create: [
      // Meeting validation rules
    ],
    update: [
      // Update validation rules
    ]
  }
};

module.exports = {
  validateRequest,
  validationRules
}; 