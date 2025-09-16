const Slot = require('../models/Slot');
const { AppError } = require('../middleware/errorHandler');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const slotController = {
  // Create available slots
  create: asyncHandler(async (req, res) => {
    const { startTime, endTime, recurrence } = req.body;

    const slot = new Slot({
      user: req.user._id,
      startTime,
      endTime,
      recurrence
    });

    await slot.save();

    res.status(201).json(
      ApiResponse.success(
        'Slot created successfully',
        slot
      )
    );
  }),

  // Get available slots
  getAvailable: asyncHandler(async (req, res) => {
    const { userId, startDate, endDate } = req.query;

    let query = {
      isBooked: false,
      startTime: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (userId) {
      query.user = userId;
    }

    const slots = await Slot.find(query)
      .populate('user', 'firstName lastName email')
      .sort({ startTime: 1 });

    res.json(
      ApiResponse.success(
        'Available slots retrieved successfully',
        slots
      )
    );
  }),

  // Book a slot
  bookSlot: asyncHandler(async (req, res) => {
    const { slotId, meetingId } = req.body;

    const slot = await Slot.findById(slotId);

    if (!slot) {
      throw new AppError('Slot not found', 404);
    }

    if (slot.isBooked) {
      throw new AppError('Slot is already booked', 400);
    }

    slot.isBooked = true;
    slot.meeting = meetingId;
    await slot.save();

    res.json(
      ApiResponse.success(
        'Slot booked successfully',
        slot
      )
    );
  }),

  // Get user's slots
  async getUserSlots(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const startDate = req.query.startDate;
      const endDate = req.query.endDate;

      let query = {
        user: req.user._id
      };

      if (startDate && endDate) {
        query.startTime = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const total = await Slot.countDocuments(query);
      const slots = await Slot.find(query)
        .populate('meeting')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ startTime: 1 });

      res.json({
        success: true,
        data: slots,
        pagination: {
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = slotController; 