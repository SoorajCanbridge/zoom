const express = require('express');
const router = express.Router();
const { authEither } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');
const { check } = require('express-validator');
const { validateRequest } = require('../utils/validator');

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Razorpay order creation and verification
 */

router.use(authEither);

/**
 * @swagger
 * /api/payments/create-order:
 *   post:
 *     summary: Create Razorpay order for a meeting
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meetingId: { type: string }
 *             required: [meetingId]
 *     responses:
 *       200:
 *         description: Order created
 */
router.post('/create-order', [
  check('meetingId').isMongoId().withMessage('Valid meetingId is required')
], validateRequest, paymentController.createOrder);

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify Razorpay payment for a meeting
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               meetingId: { type: string }
 *               razorpay_order_id: { type: string }
 *               razorpay_payment_id: { type: string }
 *               razorpay_signature: { type: string }
 *             required: [meetingId, razorpay_order_id, razorpay_payment_id, razorpay_signature]
 *     responses:
 *       200:
 *         description: Payment verified
 */
router.post('/verify', [
  check('meetingId').isMongoId().withMessage('Valid meetingId is required'),
  check('razorpay_order_id').notEmpty(),
  check('razorpay_payment_id').notEmpty(),
  check('razorpay_signature').notEmpty()
], validateRequest, paymentController.verifyPayment);

module.exports = router;

