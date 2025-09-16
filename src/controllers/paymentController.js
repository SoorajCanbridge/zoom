const Meeting = require('../models/Meeting');
const razorpayService = require('../services/razorpayService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const { AppError } = require('../middleware/errorHandler');

const paymentController = {
  createOrder: asyncHandler(async (req, res) => {
    const { meetingId } = req.body;
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }
    if (!meeting.paymentRequired) {
      return res.json(ApiResponse.success('Payment not required for this meeting', { meetingId }));
    }
    if (!Number.isFinite(meeting.price) || meeting.price <= 0) {
      throw new AppError('Invalid meeting price', 400);
    }

    const order = await razorpayService.createOrder(
      meeting.price,
      meeting.currency || 'INR',
      `meeting_${meeting._id}`,
      { meetingId: String(meeting._id) }
    );

    meeting.razorpayOrderId = order.id;
    meeting.paymentStatus = 'pending';
    await meeting.save();

    res.status(201).json(
      ApiResponse.success('Order created', {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      })
    );
  }),

  verifyPayment: asyncHandler(async (req, res) => {
    const { meetingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const meeting = await Meeting.findById(meetingId);
    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }
    if (!meeting.razorpayOrderId || meeting.razorpayOrderId !== razorpay_order_id) {
      throw new AppError('Order mismatch', 400);
    }

    const isValid = razorpayService.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) {
      meeting.paymentStatus = 'failed';
      await meeting.save();
      throw new AppError('Invalid payment signature', 400);
    }

    meeting.paymentStatus = 'paid';
    meeting.razorpayPaymentId = razorpay_payment_id;
    meeting.razorpaySignature = razorpay_signature;
    await meeting.save();

    res.json(
      ApiResponse.success('Payment verified successfully', {
        meetingId: meeting._id,
        status: meeting.paymentStatus
      })
    );
  })
};

module.exports = paymentController;

