const cron = require('node-cron');
const Meeting = require('../models/Meeting');
const emailService = require('./emailService');
const { logger } = require('../config/logger');

// Run every minute to check for upcoming meetings
cron.schedule('* * * * *', async () => {
  try {
    const fifteenMinutesFromNow = new Date(Date.now() + 15 * 60 * 1000);
    const meetings = await Meeting.find({
      startTime: {
        $gte: new Date(),
        $lte: fifteenMinutesFromNow
      },
      reminderSent: { $ne: true }
    }).populate('customer host');

    for (const meeting of meetings) {
      await emailService.sendMeetingReminder(meeting, meeting.customer);
      await emailService.sendMeetingReminder(meeting, meeting.host);
      
      meeting.reminderSent = true;
      await meeting.save();
    }
  } catch (error) {
    logger.error('Meeting reminder scheduler error:', error);
  }
}); 