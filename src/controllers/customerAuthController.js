const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const { AppError } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const crypto = require('crypto');

function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const customerAuthController = {
  signup: asyncHandler(async (req, res) => {
    const { name, email, phone, company, password } = req.body;

    const existing = await Customer.findOne({ email });
    if (existing) {
      throw new AppError('Email already registered', 400);
    }

    const otp = generateOtpCode();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const customer = new Customer({
      name,
      email,
      phone,
      company,
      password,
      status: 'active',
      otpCode: otp,
      otpExpiresAt: otpExpiry,
      isVerified: false
    });

    await customer.save();

    await emailService.sendCustomerOtp(email, otp, name);

    res.status(201).json(
      ApiResponse.success('Signup successful. Please verify OTP sent to email.', {
        customerId: customer._id
      })
    );
  }),

  verifyOtp: asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    const customer = await Customer.findOne({ email }).select('+otpCode');

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    if (customer.isVerified) {
      return res.json(ApiResponse.success('Already verified'));
    }
    if (!customer.otpCode || !customer.otpExpiresAt || customer.otpExpiresAt < new Date()) {
      throw new AppError('OTP expired. Please request a new one.', 400);
    }
    if (customer.otpCode !== otp) {
      throw new AppError('Invalid OTP', 400);
    }

    customer.isVerified = true;
    customer.otpCode = undefined;
    customer.otpExpiresAt = undefined;
    await customer.save();

    const token = jwt.sign({ customerId: customer._id, type: 'customer' }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json(
      ApiResponse.success('Verification successful', {
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email
        }
      })
    );
  }),

  login: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email }).select('+password');
    if (!customer || !(await customer.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }
    if (!customer.isVerified) {
      throw new AppError('Please verify your email via OTP first', 403);
    }
    if (customer.status === 'inactive') {
      throw new AppError('Account is inactive', 403);
    }

    const token = jwt.sign({ customerId: customer._id, type: 'customer' }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json(
      ApiResponse.success('Login successful', {
        token,
        customer: {
          id: customer._id,
          name: customer.name,
          email: customer.email
        }
      })
    );
  }),

  resendOtp: asyncHandler(async (req, res) => {
    const { email } = req.body;
    const customer = await Customer.findOne({ email });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    if (customer.isVerified) {
      return res.json(ApiResponse.success('Already verified'));
    }
    const otp = generateOtpCode();
    customer.otpCode = otp;
    customer.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await customer.save();
    await emailService.sendCustomerOtp(email, otp, customer.name);
    res.json(ApiResponse.success('OTP resent successfully'));
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const { email } = req.body;
    const customer = await Customer.findOne({ email });
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    customer.resetPasswordToken = resetToken;
    customer.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await customer.save();
    await emailService.sendCustomerPasswordReset(customer, resetToken);
    res.json(ApiResponse.success('Password reset email sent'));
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    const customer = await Customer.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');
    if (!customer) {
      throw new AppError('Invalid or expired reset token', 400);
    }
    customer.password = password;
    customer.resetPasswordToken = undefined;
    customer.resetPasswordExpires = undefined;
    await customer.save();
    res.json(ApiResponse.success('Password has been reset successfully'));
  })
};

module.exports = customerAuthController;

