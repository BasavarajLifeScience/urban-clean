const logger = require('../utils/logger');
const { sendError } = require('../utils/response.utils');

/**
 * Handle 404 - Not Found
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    user: req.user?.userId,
  });

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return sendError(res, 400, 'Validation failed', messages);
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(res, 409, `${field} already exists`);
  }

  // Handle Mongoose cast errors
  if (err.name === 'CastError') {
    return sendError(res, 400, 'Invalid ID format');
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 401, 'Token expired');
  }

  // Handle custom app errors
  if (err.isOperational) {
    return sendError(
      res,
      err.statusCode || 500,
      err.message,
      process.env.NODE_ENV === 'development' ? err.stack : null
    );
  }

  // Handle unknown errors
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  return sendError(
    res,
    statusCode,
    err.message || 'Internal Server Error',
    process.env.NODE_ENV === 'development' ? err.stack : null
  );
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
};
