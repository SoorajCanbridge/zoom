const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { connectDB } = require('./src/config/database');
const logger = require('./src/config/logger');
const errorHandler = require('./src/middleware/errorHandler');
const requestLogger = require('./src/middleware/requestLogger');
const dotenv = require('dotenv');
dotenv.config();
// const { createRateLimiter } = require('./src/middleware/validate');

// Import routes
const authRoutes = require('./src/routes/auth');
const customerRoutes = require('./src/routes/customers');
const meetingRoutes = require('./src/routes/meetings');
const slotRoutes = require('./src/routes/slots');
const customerAuthRoutes = require('./src/routes/customerAuth');
const paymentRoutes = require('./src/routes/payments');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');

// Initialize express app
const app = express();
logger.info('Starting the application...');
// Connect to MongoDB
connectDB();

// // Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined', { stream: logger.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// // Add request logger
app.use(requestLogger);

// // Add rate limiter to all routes
// app.use(createRateLimiter());

// // Routes
app.use('/api/auth', authRoutes);
app.use('/api/customer-auth', customerAuthRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/payments', paymentRoutes);

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// // Error handling
// app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})

module.exports = app;