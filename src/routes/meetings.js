const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
// const { validate } = require('../middleware/validate');
const meetingController = require('../controllers/meetingController');
// const { check } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Meetings
 *   description: Manage Zoom meetings
 */

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
/**
 * @swagger
 * /api/meetings:
 *   post:
 *     summary: Create a meeting
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               customerId:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               duration:
 *                 type: number
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               paymentRequired:
 *                 type: boolean
 *               notes:
 *                 type: string
 *             required: [title, customerId, startTime]
 *     responses:
 *       201:
 *         description: Meeting created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       400:
 *         description: Validation error
 */
router.post('/', 
  // validate(meetingValidation), 
  meetingController.create
);

/**
 * @swagger
 * /api/meetings:
 *   get:
 *     summary: List meetings
 *     tags: [Meetings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
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
 *         description: Paginated meetings
 */
router.get('/', 
  meetingController.getAll
);

/**
 * @swagger
 * /api/meetings/{id}/status:
 *   patch:
 *     summary: Update meeting status
 *     tags: [Meetings]
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
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *     responses:
 *       200:
 *         description: Status updated
 *       404:
 *         description: Meeting not found
 */
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