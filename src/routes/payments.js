const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');
const { check } = require('express-validator');
const { validateRequest } = require('../utils/validator');

router.use(auth);

router.post('/create-order', [
  check('meetingId').isMongoId().withMessage('Valid meetingId is required')
], validateRequest, paymentController.createOrder);

router.post('/verify', [
  check('meetingId').isMongoId().withMessage('Valid meetingId is required'),
  check('razorpay_order_id').notEmpty(),
  check('razorpay_payment_id').notEmpty(),
  check('razorpay_signature').notEmpty()
], validateRequest, paymentController.verifyPayment);

module.exports = router;

