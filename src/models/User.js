const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'agent'],
    default: 'agent'
  },
  department: {
    type: String,
    enum: ['sales', 'support', 'marketing', 'management'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  zoomUserId: {
    type: String,
    sparse: true
  },
  profileImage: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  availableHours: {
    monday: [{
      start: String,
      end: String
    }],
    tuesday: [{
      start: String,
      end: String
    }],
    wednesday: [{
      start: String,
      end: String
    }],
    thursday: [{
      start: String,
      end: String
    }],
    friday: [{
      start: String,
      end: String
    }],
    saturday: [{
      start: String,
      end: String
    }],
    sunday: [{
      start: String,
      end: String
    }]
  },
  preferences: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    defaultMeetingDuration: {
      type: Number,
      default: 30 // in minutes
    }
  },
  lastLogin: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
}, {
  timestamps: true
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to check if user can create meetings
userSchema.methods.canCreateMeetings = function() {
  return ['admin', 'manager', 'agent'].includes(this.role) && this.status === 'active';
};

// Method to get available slots for a specific day
userSchema.methods.getAvailableSlotsForDay = function(day) {
  return this.availableHours[day.toLowerCase()] || [];
};

module.exports = mongoose.model('User', userSchema); 