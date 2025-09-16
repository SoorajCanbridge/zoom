const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
// const { validate } = require('../middleware/validate');
const meetingController = require('../controllers/meetingController');
// const { check } = require('express-validator');

// Validation rules
// const meetingValidation = [
//   check('title').notEmpty().trim().withMessage('Title is required'),
//   check('customerId').isMongoId().withMessage('Valid customer ID is required'),
//   check('startTime').isISO8601().toDate().withMessage('Valid start time is required'),
//   check('duration')
//     .isInt({ min: 15, max: 180 })
//     .withMessage('Duration must be between 15 and 180 minutes')
// ];

// const statusValidation = [
//   check('status')
//     .isIn(['scheduled', 'completed', 'cancelled'])
//     .withMessage('Invalid status')
// ];

// Apply auth middleware to all routes
router.use(auth);

// Routes
router.post('/', 
  // validate(meetingValidation), 
  meetingController.create
);

router.get('/', 
  meetingController.getAll
);

router.patch('/:id/status', 
  // validate(statusValidation), 
  meetingController.updateStatus
);

// Additional routes for meeting management
// router.get('/upcoming', 
//   meetingController.getUpcoming
// );

// router.get('/:id', 
//   meetingController.getById
// );

// router.get('/customer/:customerId', 
//   meetingController.getCustomerMeetings
// );

module.exports = router; 