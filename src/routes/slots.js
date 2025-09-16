const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
// const { validate } = require('../middleware/validate');
const slotController = require('../controllers/slotController');
// const { check } = require('express-validator');

// Validation rules
// const slotValidation = [
//   check('startTime')
//     .isISO8601()
//     .toDate()
//     .withMessage('Valid start time is required'),
//   check('endTime')
//     .isISO8601()
//     .toDate()
//     .withMessage('Valid end time is required')
//     .custom((endTime, { req }) => {
//       if (new Date(endTime) <= new Date(req.body.startTime)) {
//         throw new Error('End time must be after start time');
//       }
//       return true;
//     }),
//   check('recurrence')
//     .optional()
//     .isIn(['none', 'daily', 'weekly', 'monthly'])
//     .withMessage('Invalid recurrence pattern')
// ];

// const bookingValidation = [
//   check('slotId').isMongoId().withMessage('Valid slot ID is required'),
//   check('meetingId').isMongoId().withMessage('Valid meeting ID is required')
// ];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.post('/', 
  // validate(slotValidation), 
  slotController.create
);

router.get('/available', 
  slotController.getAvailable
);

router.post('/book', 
  // validate(bookingValidation), 
  slotController.bookSlot
);

router.get('/my-slots', 
  slotController.getUserSlots
);

// Additional routes for slot management
// router.delete('/:id', 
//   slotController.delete
// );

// router.patch('/:id/recurrence', 
//   // validate([
//   //   check('recurrence')
//   //     .isIn(['none', 'daily', 'weekly', 'monthly'])
//   //     .withMessage('Invalid recurrence pattern')
//   // ]),
//   slotController.updateRecurrence
// );

module.exports = router; 