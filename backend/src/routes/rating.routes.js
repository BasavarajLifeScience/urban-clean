const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ratingController = require('../controllers/rating.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const validate = require('../middleware/validate.middleware');

// Validation
const createRatingValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('ratedTo').notEmpty().withMessage('Rated to (sevak ID) is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
];

// Routes
router.post('/', authenticate, createRatingValidation, validate, asyncHandler(ratingController.createRating));
router.get('/sevak/:sevakId', asyncHandler(ratingController.getSevakRatings));
router.get('/booking/:bookingId', authenticate, asyncHandler(ratingController.getBookingRating));
router.put('/:ratingId', authenticate, asyncHandler(ratingController.updateRating));
router.post('/:ratingId/report', authenticate, asyncHandler(ratingController.reportRating));

module.exports = router;
