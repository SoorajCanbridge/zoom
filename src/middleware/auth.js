const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.userId, status: 'active' });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Please authenticate',
      error: error.message
    });
  }
};

// Middleware for role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this resource'
      });
    }
    next();
  };
};

module.exports = { auth, authorize }; 

// Customer-only auth middleware
const authCustomer = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.customerId) {
      return res.status(401).json({ success: false, message: 'Invalid customer token' });
    }
    const customer = await Customer.findOne({ _id: decoded.customerId, status: { $ne: 'inactive' } });
    if (!customer || !customer.isVerified) {
      return res.status(401).json({ success: false, message: 'Customer not found or not verified' });
    }
    req.customer = customer;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Please authenticate', error: error.message });
  }
};

// Auth that accepts either staff User or Customer tokens
const authEither = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'No authentication token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId) {
      const user = await User.findOne({ _id: decoded.userId, status: 'active' });
      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or inactive' });
      }
      req.user = user;
      req.token = token;
      return next();
    }
    if (decoded.customerId) {
      const customer = await Customer.findOne({ _id: decoded.customerId, status: { $ne: 'inactive' } });
      if (!customer || !customer.isVerified) {
        return res.status(401).json({ success: false, message: 'Customer not found or not verified' });
      }
      req.customer = customer;
      req.token = token;
      return next();
    }
    return res.status(401).json({ success: false, message: 'Invalid token' });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Please authenticate', error: error.message });
  }
};

module.exports.authCustomer = authCustomer;
module.exports.authEither = authEither;