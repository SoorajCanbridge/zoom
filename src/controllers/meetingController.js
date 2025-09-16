const Meeting = require('../models/Meeting');
const Customer = require('../models/Customer');
const { AppError } = require('../middleware/errorHandler');
const zoomService = require('../services/zoomService');
const emailService = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const meetingController = {
  // Create new meeting
  create: asyncHandler(async (req, res) => {
    const { title, customerId, startTime, duration } = req.body;

    if (!title || typeof title !== 'string') {
      throw new AppError('Valid title is required', 400);
    }
    if (!customerId) {
      throw new AppError('customerId is required', 400);
    }
    if (!startTime) {
      throw new AppError('startTime is required', 400);
    }
    const durationMinutes = duration != null ? Number(duration) : 30;
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      throw new AppError('duration must be a positive number', 400);
    }

    const parsedStart = new Date(startTime);
    if (Number.isNaN(parsedStart.getTime())) {
      throw new AppError('startTime must be a valid date', 400);
    }
    if (parsedStart.getTime() < Date.now()) {
      throw new AppError('startTime must be in the future', 400);
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const startIso = parsedStart.toISOString();
    const zoomMeeting = await zoomService.createMeeting({
      topic: title,
      start_time: startIso,
      duration: durationMinutes
    });

    const meeting = new Meeting({
      title,
      customer: customerId,
      host: req.user._id,
      startTime: parsedStart,
      duration: durationMinutes,
      zoomMeetingId: String(zoomMeeting.id || zoomMeeting.uuid || ''),
      zoomJoinUrl: zoomMeeting.join_url
    });

    await meeting.save();

    const confirmationExtras = {
      zoomJoinUrl: zoomMeeting.join_url,
      zoomPassword: zoomMeeting.password,
    };

    await emailService.sendMeetingConfirmation({ ...meeting.toObject(), ...confirmationExtras }, customer);
    await emailService.sendMeetingConfirmation({ ...meeting.toObject(), ...confirmationExtras }, req.user);

    res.status(201).json(
      ApiResponse.success(
        'Meeting created successfully',
        {
          ...meeting.toObject(),
          zoomJoinUrl: zoomMeeting.join_url,
          zoomPassword: zoomMeeting.password,
          zoomStartUrl: zoomMeeting.start_url
        }
      )
    );
  }),

  // Get all meetings with filters
  getAll: asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    let query = {};

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add date range filter
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // If user is not admin, only show their meetings
    if (req.user.role !== 'admin') {
      query.host = req.user._id;
    }

    const total = await Meeting.countDocuments(query);
    const meetings = await Meeting.find(query)
      .populate('customer', 'name email company')
      .populate('host', 'firstName lastName email')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ startTime: 1 });

    res.json(
      ApiResponse.paginated(
        'Meetings retrieved successfully',
        meetings,
        {
          total,
          page,
          pages: Math.ceil(total / limit),
          limit
        }
      )
    );
  }),

  // Update meeting status
  updateStatus: asyncHandler(async (req, res) => {
    const { status } = req.body;
    const meeting = await Meeting.findById(req.params.id)
      .populate('customer')
      .populate('host');

    if (!meeting) {
      throw new AppError('Meeting not found', 404);
    }

    if (status === 'cancelled') {
      await zoomService.deleteMeeting(meeting.zoomMeetingId);
      await emailService.sendMail({
        to: meeting.customer.email,
        subject: `Meeting Cancelled: ${meeting.title}`,
        html: `Meeting cancelled: ${meeting.title}`
      });
    }

    meeting.status = status;
    await meeting.save();

    res.json(
      ApiResponse.success(
        'Meeting status updated successfully',
        meeting
      )
    );
  })
};

module.exports = meetingController; 