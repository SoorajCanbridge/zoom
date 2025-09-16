const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  },
  meeting: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting'
  },
  recurrence: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Slot', slotSchema); 