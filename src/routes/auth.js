const express = require('express');
const router = express.Router();
// const { validate } = require('../middleware/validate');
// const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');
// const { check } = require('express-validator');
const { validateRequest, validationRules } = require('../utils/validator');

// Validation rules
// const registerValidation = [
//   check('firstName').notEmpty().trim().withMessage('First name is required'),
//   check('lastName').notEmpty().trim().withMessage('Last name is required'),
//   check('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
//   check('password')
//     .isLength({ min: 8 })
//     .withMessage('Password must be at least 8 characters long'),
//   check('department')
//     .isIn(['sales', 'support', 'marketing', 'management'])
//     .withMessage('Invalid department')
// ];

// const loginValidation = [
//   check('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
//   check('password').notEmpty().withMessage('Password is required')
// ];

// Routes
router.post('/register',
  validationRules.user.create,
  validateRequest,
  authController.register
);

router.post('/login',
  // validationRules.user.login,
  validateRequest,
  authController.login
);

router.post('/password-reset',
  // validationRules.user.passwordReset,
  validateRequest,
  authController.requestPasswordReset
);

module.exports = router; 