const Customer = require('../models/Customer');
const { AppError } = require('../middleware/errorHandler');
const emailService = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const User = require('../models/User');

const customerController = {
  // Create new customer
  create: asyncHandler(async (req, res) => {
    const { name, email, phone, company } = req.body;
    
    const customer = new Customer({
      name,
      email,
      phone,
      company,
      assignedTo: req.user._id
    });

    await customer.save();
    await emailService.sendWelcomeEmail(customer);

    res.status(201).json(
      ApiResponse.success(
        'Customer created successfully',
        customer
      )
    );
  }),

  // Get all customers with pagination and filters
  getAll: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .populate('assignedTo', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(
      ApiResponse.paginated(
        'Customers retrieved successfully',
        customers,
        {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      )
    );
  }),

  // Get customer by ID
  getById: asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'firstName lastName email')
      .populate('notes.createdBy', 'firstName lastName');

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    res.json(
      ApiResponse.success(
        'Customer retrieved successfully',
        customer
      )
    );
  }),

  // Update customer
  update: asyncHandler(async (req, res) => {
    const updates = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // If assigned user is changed, notify new and old users
    if (updates.assignedTo && updates.assignedTo !== customer.assignedTo.toString()) {
      const newAssignee = await User.findById(updates.assignedTo);
      const oldAssignee = await User.findById(customer.assignedTo);

      if (newAssignee) {
        await emailService.sendMail({
          to: newAssignee.email,
          subject: 'New Customer Assignment',
          html: `
            <h2>New Customer Assigned</h2>
            <p>You have been assigned to customer: ${customer.name}</p>
            <p>Company: ${customer.company}</p>
          `
        });
      }

      if (oldAssignee) {
        await emailService.sendMail({
          to: oldAssignee.email,
          subject: 'Customer Reassignment Notification',
          html: `
            <h2>Customer Reassignment</h2>
            <p>Customer ${customer.name} has been reassigned to another representative.</p>
          `
        });
      }
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json(
      ApiResponse.success(
        'Customer updated successfully',
        updatedCustomer
      )
    );
  }),

  // Add note to customer
  addNote: asyncHandler(async (req, res) => {
    const { content } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    customer.notes.push({
      content,
      createdBy: req.user._id
    });

    await customer.save();

    res.json(
      ApiResponse.success(
        'Note added successfully',
        customer
      )
    );
  }),

  // Delete customer (admin only)
  delete: asyncHandler(async (req, res) => {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    await Customer.findByIdAndDelete(req.params.id);

    res.json(
      ApiResponse.success(
        'Customer deleted successfully',
        null
      )
    );
  })
};

module.exports = customerController; 