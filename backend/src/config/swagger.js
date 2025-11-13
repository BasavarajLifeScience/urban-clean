const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Urban Clean API',
      version: '1.0.0',
      description: 'Complete API documentation for Urban Clean - Society Booking Platform',
      contact: {
        name: 'API Support',
        email: 'support@urbanclean.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5001/api/v1',
        description: 'Development server (Docker)',
      },
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development server (Local)',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your Bearer token in the format: Bearer <token>',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              example: '507f1f77bcf86cd799439011',
            },
            fullName: {
              type: 'string',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              example: 'john@example.com',
            },
            phoneNumber: {
              type: 'string',
              example: '+919999999999',
            },
            role: {
              type: 'string',
              enum: ['resident', 'sevak', 'vendor', 'admin'],
              example: 'resident',
            },
            isVerified: {
              type: 'boolean',
              example: true,
            },
          },
        },
        Service: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            name: {
              type: 'string',
              example: 'House Cleaning',
            },
            category: {
              type: 'string',
              example: 'Cleaning',
            },
            description: {
              type: 'string',
            },
            basePrice: {
              type: 'number',
              example: 500,
            },
            duration: {
              type: 'number',
              example: 120,
            },
            imageUrl: {
              type: 'string',
            },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
            },
            bookingNumber: {
              type: 'string',
              example: 'BK-1234567890',
            },
            residentId: {
              type: 'string',
            },
            serviceId: {
              type: 'string',
            },
            scheduledDate: {
              type: 'string',
              format: 'date',
              example: '2025-11-25',
            },
            scheduledTime: {
              type: 'string',
              example: '10:00 AM',
            },
            status: {
              type: 'string',
              enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
              example: 'pending',
            },
            totalAmount: {
              type: 'number',
              example: 500,
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Path to API routes
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
