const express = require('express');
const router = express.Router();
// const { validate } = require('../middleware/validate');
// const { auth } = require('../middleware/auth');
const authController = require('../controllers/authController');
// const { check } = require('express-validator');
const { validateRequest, validationRules } = require('../utils/validator');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Admin user authentication
 */

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
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new admin user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName: { type: string }
 *               lastName: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               department: { type: string }
 *             required: [firstName, lastName, email, password]
 *     responses:
 *       201:
 *         description: User registered
 */
router.post('/register',
  validationRules.user.create,
  validateRequest,
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login as admin user
 *     tags: [Auth]
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
router.post('/login',
  // validationRules.user.login,
  validateRequest,
  authController.login
);

/**
 * @swagger
 * /api/auth/password-reset:
 *   post:
 *     summary: Request password reset email
 *     tags: [Auth]
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
 *         description: Email sent
 */
router.post('/password-reset',
  // validationRules.user.passwordReset,
  validateRequest,
  authController.requestPasswordReset
);

module.exports = router; 