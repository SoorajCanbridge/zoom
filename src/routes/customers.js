const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
// const { validate } = require('../middleware/validate');
const customerController = require('../controllers/customerController');
const { check } = require('express-validator');

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
router.post('/', customerController.create);
router.get('/', customerController.getAll);
router.get('/:id', customerController.getById);

router.put('/:id', 
  // validate(customerValidation), 
  customerController.update
);

router.post('/:id/notes', 
  // validate(noteValidation), 
  customerController.addNote
);

// Admin only routes
router.delete('/:id', 
  authorize('admin'), 
  customerController.delete
);

module.exports = router; 