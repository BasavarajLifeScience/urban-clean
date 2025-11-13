const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bookingController = require('../controllers/booking.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const validate = require('../middleware/validate.middleware');

// All routes require authentication
router.use(authenticate);

// Validation
const createBookingValidation = [
  body('serviceId').notEmpty().withMessage('Service ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid date is required'),
  body('scheduledTime').notEmpty().withMessage('Time is required'),
  body('address.flatNumber').notEmpty().withMessage('Flat number is required'),
];

// Routes
router.post('/', createBookingValidation, validate, asyncHandler(bookingController.createBooking));
router.get('/my-bookings', asyncHandler(bookingController.getMyBookings));
router.get('/available-slots', asyncHandler(bookingController.getAvailableSlots));
router.get('/:bookingId', asyncHandler(bookingController.getBookingById));
router.patch('/:bookingId/reschedule', asyncHandler(bookingController.rescheduleBooking));
router.patch('/:bookingId/cancel', asyncHandler(bookingController.cancelBooking));

module.exports = router;
