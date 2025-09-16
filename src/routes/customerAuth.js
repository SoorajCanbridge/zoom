const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuthController');
const { check } = require('express-validator');
const { validateRequest } = require('../utils/validator');

const signupValidation = [
  check('name').notEmpty().withMessage('Name is required'),
  check('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  check('phone').notEmpty().withMessage('Phone is required'),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

const loginValidation = [
  check('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  check('password').notEmpty().withMessage('Password is required')
];

const verifyValidation = [
  check('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  check('otp').isLength({ min: 6, max: 6 }).withMessage('Valid 6-digit OTP is required')
];

router.post('/signup', signupValidation, validateRequest, customerAuthController.signup);
router.post('/verify-otp', verifyValidation, validateRequest, customerAuthController.verifyOtp);
router.post('/login', loginValidation, validateRequest, customerAuthController.login);
router.post('/resend-otp', [check('email').isEmail().normalizeEmail()], validateRequest, customerAuthController.resendOtp);

router.post('/forgot-password', [
  check('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], validateRequest, customerAuthController.forgotPassword);

router.post('/reset-password', [
  check('token').notEmpty().withMessage('Token is required'),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validateRequest, customerAuthController.resetPassword);

module.exports = router;

