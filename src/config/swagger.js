const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Zoom Scheduler API',
      version: '1.0.0',
      description: 'API documentation for meeting scheduling, customers, slots, payments, and auth.'
    },
    servers: [
      {
        url: '/'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Meeting: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string' },
            customer: { type: 'string' },
            host: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            duration: { type: 'number' },
            zoomMeetingId: { type: 'string' },
            zoomJoinUrl: { type: 'string' },
            status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled'] },
            price: { type: 'number' },
            currency: { type: 'string' },
            paymentRequired: { type: 'boolean' },
            paymentStatus: { type: 'string', enum: ['pending', 'paid', 'failed', 'refunded'] },
            notes: { type: 'string' }
          }
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' }
          }
        },
        Customer: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            company: { type: 'string' }
          }
        },
        Slot: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            startTime: { type: 'string', format: 'date-time' },
            endTime: { type: 'string', format: 'date-time' },
            recurrence: { type: 'string', enum: ['none', 'daily', 'weekly', 'monthly'] }
          }
        },
        PaymentVerification: {
          type: 'object',
          properties: {
            meetingId: { type: 'string' },
            razorpay_order_id: { type: 'string' },
            razorpay_payment_id: { type: 'string' },
            razorpay_signature: { type: 'string' }
          }
        }
      }
    }
  },
  apis: [
    'src/routes/*.js',
    'src/controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;


