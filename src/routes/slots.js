const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
// const { validate } = require('../middleware/validate');
const slotController = require('../controllers/slotController');
// const { check } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Slots
 *   description: Manage time slots and bookings
 */
router.get('/available', 
  slotController.getAvailable
);
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
/**
 * @swagger
 * /api/slots:
 *   post:
 *     summary: Create a slot
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startTime: { type: string, format: date-time }
 *               endTime: { type: string, format: date-time }
 *               recurrence: { type: string, enum: [none, daily, weekly, monthly] }
 *             required: [startTime, endTime]
 *     responses:
 *       201:
 *         description: Slot created
 */
router.post('/', 
  // validate(slotValidation), 
  slotController.create
);

/**
 * @swagger
 * /api/slots/available:
 *   get:
 *     summary: Get available slots
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Available slots
 */


/**
 * @swagger
 * /api/slots/book:
 *   post:
 *     summary: Book a slot for a meeting
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               slotId: { type: string }
 *               meetingId: { type: string }
 *             required: [slotId, meetingId]
 *     responses:
 *       200:
 *         description: Slot booked
 */
router.post('/book', 
  // validate(bookingValidation), 
  slotController.bookSlot
);

/**
 * @swagger
 * /api/slots/my-slots:
 *   get:
 *     summary: Get my slots
 *     tags: [Slots]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of my slots
 */
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