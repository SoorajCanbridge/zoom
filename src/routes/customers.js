const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
// const { validate } = require('../middleware/validate');
const customerController = require('../controllers/customerController');
const { check } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: Manage customers and their notes
 */

// Validation rules
const customerValidation = [
  check('name').notEmpty().trim().withMessage('Name is required'),
  check('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  check('phone').notEmpty().withMessage('Phone number is required'),
  check('company').optional().trim()
];

const noteValidation = [
  check('content').notEmpty().trim().withMessage('Note content is required')
];

// Apply auth middleware to all routes
router.use(auth);

// Routes
/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
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
 *               company: { type: string }
 *             required: [name, email, phone]
 *     responses:
 *       201:
 *         description: Customer created
 */
router.post('/', customerController.create);
/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: List customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of customers
 */
router.get('/', customerController.getAll);
/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by id
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Customer details
 *       404:
 *         description: Not found
 */
router.get('/:id', customerController.getById);

/**
 * @swagger
 * /api/customers/{id}:
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Updated
 */
router.put('/:id', 
  // validate(customerValidation), 
  customerController.update
);

/**
 * @swagger
 * /api/customers/{id}/notes:
 *   post:
 *     summary: Add a note to customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content: { type: string }
 *             required: [content]
 *     responses:
 *       200:
 *         description: Note added
 */
router.post('/:id/notes', 
  // validate(noteValidation), 
  customerController.addNote
);

// Admin only routes
/**
 * @swagger
 * /api/customers/{id}:
 *   delete:
 *     summary: Delete a customer (admin only)
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Deleted
 */
router.delete('/:id', 
  authorize('admin'), 
  customerController.delete
);

module.exports = router; 