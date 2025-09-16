const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  host: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 30 // duration in minutes
  },
  zoomMeetingId: {
    type: String
  },
  zoomJoinUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  price: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paymentRequired: {
    type: Boolean,
    default: false
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Meeting', meetingSchema); 