const nodemailer = require('nodemailer');
const { logger } = require('../config/logger');
const { AppError } = require('../middleware/errorHandler');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendMail(options) {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info('Email sent successfully:', {
        to: options.to,
        subject: options.subject,
        messageId: info.messageId
      });
      return info;
    } catch (error) {
      logger.error('Email sending failed:', {
        error: error.message,
        to: options.to,
        subject: options.subject
      });
      throw new AppError('Failed to send email', 500);
    }
  }

  // Meeting notification templates
  async sendMeetingConfirmation(meeting, recipient) {
    const template = `
      <h2>Meeting Confirmation</h2>
      <p>Your meeting has been scheduled successfully.</p>
      <p><strong>Title:</strong> ${meeting.title}</p>
      <p><strong>Date:</strong> ${new Date(meeting.startTime).toLocaleString()}</p>
      <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
      <p><strong>Zoom Link:</strong> <a href="${meeting.zoomJoinUrl}">Join Meeting</a></p>
    `;

    await this.sendMail({
      to: recipient.email,
      subject: `Meeting Confirmation: ${meeting.title}`,
      html: template
    });
  }

  async sendMeetingReminder(meeting, recipient) {
    const template = `
      <h2>Meeting Reminder</h2>
      <p>Your meeting is starting in 15 minutes.</p>
      <p><strong>Title:</strong> ${meeting.title}</p>
      <p><strong>Time:</strong> ${new Date(meeting.startTime).toLocaleString()}</p>
      <p><strong>Zoom Link:</strong> <a href="${meeting.zoomJoinUrl}">Join Meeting</a></p>
    `;

    await this.sendMail({
      to: recipient.email,
      subject: `Reminder: ${meeting.title}`,
      html: template
    });
  }

  // Customer related templates
  async sendWelcomeEmail(customer) {
    const template = `
      <h2>Welcome to Our CRM</h2>
      <p>Dear ${customer.name},</p>
      <p>Thank you for choosing our services. We're excited to work with you!</p>
      <p>If you have any questions, feel free to reach out to your assigned representative.</p>
    `;

    await this.sendMail({
      to: customer.email,
      subject: 'Welcome to Our CRM',
      html: template
    });
  }

  // User related templates
  async sendPasswordReset(user, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const template = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    await this.sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      html: template
    });
  }

  async sendCustomerOtp(email, otp, name = 'Customer') {
    const template = `
      <h2>Your Verification Code</h2>
      <p>Hi ${name},</p>
      <p>Your one-time verification code is:</p>
      <h1 style="letter-spacing:4px;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't request this, you can ignore this email.</p>
    `;

    await this.sendMail({
      to: email,
      subject: 'Your OTP Code',
      html: template
    });
  }

  async sendCustomerPasswordReset(customer, resetToken) {
    const resetUrl = `${process.env.FRONTEND_URL}/customer-reset-password?token=${resetToken}`;
    const template = `
      <h2>Password Reset Request</h2>
      <p>Hi ${customer.name},</p>
      <p>Click the link below to reset your password. The link will expire in 1 hour:</p>
      <p><a href="${resetUrl}">Reset Password</a></p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.sendMail({
      to: customer.email,
      subject: 'Password Reset Request',
      html: template
    });
  }
}

module.exports = new EmailService(); 