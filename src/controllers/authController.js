const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');
const crypto = require('crypto');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const authController = {
  // Register new user
  register: asyncHandler(async (req, res) => {
    const { firstName, lastName, email, password, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      department
    });

    await user.save();

    // Send welcome email to new user
    await emailService.sendWelcomeEmail(user);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.status(201).json(
      ApiResponse.success(
        'User registered successfully',
        {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          },
          token
        }
      )
    );
  }),

  // Login user
  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status !== 'active') {
      throw new AppError('Account is inactive', 403);
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json(
      ApiResponse.success(
        'Login successful',
        {
          user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role
          },
          token
        }
      )
    );
  }),

  // Request password reset
  requestPasswordReset: asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email
    await emailService.sendPasswordReset(user, resetToken);

    res.json(
      ApiResponse.success(
        'Password reset email sent successfully'
      )
    );
  })
};

module.exports = authController; 