const express = require('express');
const router = express.Router();
const customerAuthController = require('../controllers/customerAuthController');
const { check } = require('express-validator');
const { validateRequest } = require('../utils/validator');

/**
 * @swagger
 * tags:
 *   name: CustomerAuth
 *   description: Customer authentication flows
 */

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

/**
 * @swagger
 * /api/customer-auth/signup:
 *   post:
 *     summary: Customer signup with OTP
 *     tags: [CustomerAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               password: { type: string }
 *             required: [name, email, phone, password]
 *     responses:
 *       200:
 *         description: OTP sent to email
 */
router.post('/signup', signupValidation, validateRequest, customerAuthController.signup);
/**
 * @swagger
 * /api/customer-auth/verify-otp:
 *   post:
 *     summary: Verify OTP for signup
 *     tags: [CustomerAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               otp: { type: string }
 *             required: [email, otp]
 *     responses:
 *       200:
 *         description: Signup verified
 */
router.post('/verify-otp', verifyValidation, validateRequest, customerAuthController.verifyOtp);
/**
 * @swagger
 * /api/customer-auth/login:
 *   post:
 *     summary: Customer login
 *     tags: [CustomerAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *             required: [email, password]
 *     responses:
 *       200:
 *         description: Authenticated
 */
router.post('/login', loginValidation, validateRequest, customerAuthController.login);
/**
 * @swagger
 * /api/customer-auth/resend-otp:
 *   post:
 *     summary: Resend OTP for signup
 *     tags: [CustomerAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *             required: [email]
 *     responses:
 *       200:
 *         description: OTP resent
 */
router.post('/resend-otp', [check('email').isEmail().normalizeEmail()], validateRequest, customerAuthController.resendOtp);

/**
 * @swagger
 * /api/customer-auth/forgot-password:
 *   post:
 *     summary: Customer forgot password
 *     tags: [CustomerAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *             required: [email]
 *     responses:
 *       200:
 *         description: Reset email sent
 */
router.post('/forgot-password', [
  check('email').isEmail().normalizeEmail().withMessage('Valid email is required')
], validateRequest, customerAuthController.forgotPassword);

/**
 * @swagger
 * /api/customer-auth/reset-password:
 *   post:
 *     summary: Customer reset password
 *     tags: [CustomerAuth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string }
 *               password: { type: string }
 *             required: [token, password]
 *     responses:
 *       200:
 *         description: Password updated
 */
router.post('/reset-password', [
  check('token').notEmpty().withMessage('Token is required'),
  check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validateRequest, customerAuthController.resetPassword);

module.exports = router;

