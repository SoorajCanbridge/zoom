const { logger } = require('../config/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log when the request completes
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('user-agent'),
      userId: req.user ? req.user._id : 'unauthenticated'
    });
  });

  next();
};

module.exports = requestLogger; 