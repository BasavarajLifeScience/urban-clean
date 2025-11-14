const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

const logger = require('./utils/logger');
const { notFound, errorHandler } = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rateLimit.middleware');
const routes = require('./routes');

// Create Express app
const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['*'];
logger.info(`🌐 [CORS] Allowed origins: ${JSON.stringify(allowedOrigins)}`);

const corsOptions = {
  origin: (origin, callback) => {
    logger.info(`🌐 [CORS] Request from origin: ${origin || 'no origin (mobile/native app)'}`);

    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) {
      logger.info('✅ [CORS] Allowing request with no origin header');
      return callback(null, true);
    }

    // If ALLOWED_ORIGINS is '*', allow all
    if (allowedOrigins.includes('*')) {
      logger.info('✅ [CORS] Allowing all origins (wildcard)');
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      logger.info(`✅ [CORS] Origin ${origin} is in allowed list`);
      return callback(null, true);
    }

    logger.warn(`❌ [CORS] Origin ${origin} not allowed`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  }));
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting for API routes
app.use('/api', apiLimiter);

// API routes
app.use('/api/v1', routes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Society Booking API',
    version: '1.0.0',
    endpoints: {
      health: '/api/v1/health',
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      services: '/api/v1/services',
      bookings: '/api/v1/bookings',
      payments: '/api/v1/payments',
      ratings: '/api/v1/ratings',
      sevak: '/api/v1/sevak',
      notifications: '/api/v1/notifications',
    },
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;
