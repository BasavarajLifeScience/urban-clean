const Rating = require('../models/Rating');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/User');
const mongoose = require('mongoose');
const { sendSuccess, sendPaginated } = require('../utils/response.utils');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');
const { getPagination } = require('../utils/helpers');

/**
 * Create rating
 */
const createRating = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { bookingId, ratedTo, rating, comment } = req.body;

    // Get booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user is the resident of this booking
    if (booking.residentId.toString() !== userId.toString()) {
      throw new ForbiddenError('You can only rate bookings you created');
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      throw new ValidationError('Can only rate completed bookings');
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({ bookingId });

    if (existingRating) {
      throw new ValidationError('Rating already exists for this booking');
    }

    // Create rating
    const newRating = await Rating.create({
      bookingId,
      ratedTo,
      ratedBy: userId,
      rating,
      comment,
    });

    // Update service average rating
    const service = await Service.findById(booking.serviceId);
    if (service) {
      const totalRatings = service.totalRatings + 1;
      const newAverage = ((service.averageRating * service.totalRatings) + rating) / totalRatings;
      service.averageRating = Math.round(newAverage * 10) / 10;
      service.totalRatings = totalRatings;
      await service.save();
    }

    return sendSuccess(res, 201, 'Rating created successfully', { rating: newRating });
  } catch (error) {
    next(error);
  }
};

/**
 * Get ratings for a sevak
 */
const getSevakRatings = async (req, res, next) => {
  try {
    const { sevakId } = req.params;
    const { page, limit, sort } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    // Build sort
    let sortOption = { createdAt: -1 };
    if (sort === 'highest') sortOption = { rating: -1 };
    if (sort === 'lowest') sortOption = { rating: 1 };

    const ratings = await Rating.find({ ratedTo: sevakId })
      .populate('ratedBy', 'fullName')
      .populate('bookingId', 'bookingNumber scheduledDate')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    const total = await Rating.countDocuments({ ratedTo: sevakId });

    // Calculate average rating
    const ratingStats = await Rating.aggregate([
      { $match: { ratedTo: new mongoose.Types.ObjectId(sevakId) } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
        },
      },
    ]);

    const averageRating = ratingStats[0]?.averageRating || 0;
    const totalRatings = ratingStats[0]?.totalRatings || 0;

    return sendPaginated(res, ratings, pageNum, limitNum, total, 'Ratings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get rating for a booking
 */
const getBookingRating = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const rating = await Rating.findOne({ bookingId })
      .populate('ratedBy', 'fullName')
      .populate('ratedTo', 'fullName');

    if (!rating) {
      throw new NotFoundError('Rating not found');
    }

    return sendSuccess(res, 200, 'Rating retrieved successfully', { rating });
  } catch (error) {
    next(error);
  }
};

/**
 * Update rating
 */
const updateRating = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { ratingId } = req.params;
    const { rating, comment } = req.body;

    const existingRating = await Rating.findById(ratingId);

    if (!existingRating) {
      throw new NotFoundError('Rating not found');
    }

    // Check permission
    if (existingRating.ratedBy.toString() !== userId) {
      throw new ForbiddenError('You can only update your own ratings');
    }

    // Update rating
    existingRating.rating = rating;
    existingRating.comment = comment;
    await existingRating.save();

    return sendSuccess(res, 200, 'Rating updated successfully', { rating: existingRating });
  } catch (error) {
    next(error);
  }
};

/**
 * Report rating
 */
const reportRating = async (req, res, next) => {
  try {
    const { ratingId } = req.params;
    const { reason } = req.body;

    const rating = await Rating.findById(ratingId);

    if (!rating) {
      throw new NotFoundError('Rating not found');
    }

    rating.isReported = true;
    rating.reportReason = reason;
    await rating.save();

    return sendSuccess(res, 200, 'Rating reported successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRating,
  getSevakRatings,
  getBookingRating,
  updateRating,
  reportRating,
};
