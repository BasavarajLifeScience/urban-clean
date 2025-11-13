const Booking = require('../models/Booking');
const Service = require('../models/Service');
const { sendSuccess, sendPaginated } = require('../utils/response.utils');
const { generateBookingNumber, getPagination, generateOTP } = require('../utils/helpers');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');
const { notifyBookingCreated, notifyBookingStatusChange } = require('../services/notification.service');

/**
 * Create new booking
 */
const createBooking = async (req, res, next) => {
  try {
    const residentId = req.user.userId;
    const { serviceId, scheduledDate, scheduledTime, address, specialInstructions } = req.body;

    // Get service details
    const service = await Service.findById(serviceId);

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    // Generate booking number
    const bookingNumber = generateBookingNumber();

    // Create booking
    const booking = await Booking.create({
      bookingNumber,
      residentId,
      serviceId,
      scheduledDate,
      scheduledTime,
      estimatedDuration: service.duration,
      address,
      specialInstructions,
      basePrice: service.basePrice,
      totalAmount: service.basePrice,
      checkInOTP: generateOTP(6),
    });

    // Increment booking count for service
    service.bookingCount += 1;
    await service.save();

    // Send notification
    await notifyBookingCreated(booking, { _id: residentId });

    return sendSuccess(res, 201, 'Booking created successfully', { booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user bookings
 */
const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { status, page, limit } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    const query = { residentId: userId };

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('serviceId', 'name category imageUrl basePrice')
      .populate('sevakId', 'fullName phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    return sendPaginated(res, bookings, pageNum, limitNum, total, 'Bookings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 */
const getBookingById = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;

    const booking = await Booking.findById(bookingId)
      .populate('serviceId')
      .populate('sevakId', 'fullName phoneNumber email')
      .populate('residentId', 'fullName phoneNumber email');

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check if user has permission to view this booking
    if (booking.residentId._id.toString() !== userId && booking.sevakId?._id.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to view this booking');
    }

    return sendSuccess(res, 200, 'Booking retrieved successfully', {
      booking,
      service: booking.serviceId,
      sevak: booking.sevakId,
      timeline: booking.timeline,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reschedule booking
 */
const rescheduleBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;
    const { newDate, newTime } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check permission
    if (booking.residentId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to reschedule this booking');
    }

    // Check if booking can be rescheduled
    if (['completed', 'cancelled', 'refunded'].includes(booking.status)) {
      throw new ValidationError('Cannot reschedule this booking');
    }

    // Update booking
    booking.scheduledDate = newDate;
    booking.scheduledTime = newTime;
    booking.timeline.push({
      status: 'rescheduled',
      timestamp: new Date(),
      notes: `Rescheduled to ${newDate} at ${newTime}`,
    });

    await booking.save();

    // Notify sevak if assigned
    if (booking.sevakId) {
      await notifyBookingStatusChange(booking, booking.sevakId, 'rescheduled');
    }

    return sendSuccess(res, 200, 'Booking rescheduled successfully', { booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.userId;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check permission
    if (booking.residentId.toString() !== userId) {
      throw new ForbiddenError('You do not have permission to cancel this booking');
    }

    // Check if booking can be cancelled
    if (['completed', 'cancelled', 'refunded'].includes(booking.status)) {
      throw new ValidationError('Cannot cancel this booking');
    }

    // Calculate refund amount based on cancellation policy
    let refundAmount = 0;
    if (booking.paymentStatus === 'paid') {
      refundAmount = booking.totalAmount; // Full refund for POC
    }

    // Update booking
    booking.status = 'cancelled';
    booking.cancelledBy = userId;
    booking.cancellationReason = reason;
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    booking.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      notes: `Cancelled by resident: ${reason}`,
    });

    await booking.save();

    // Notify sevak if assigned
    if (booking.sevakId) {
      await notifyBookingStatusChange(booking, booking.sevakId, 'cancelled');
    }

    return sendSuccess(res, 200, 'Booking cancelled successfully', {
      booking,
      refundAmount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available time slots
 */
const getAvailableSlots = async (req, res, next) => {
  try {
    const { serviceId, date } = req.query;

    if (!serviceId || !date) {
      throw new ValidationError('Service ID and date are required');
    }

    // Get all bookings for this service on the given date
    const bookings = await Booking.find({
      serviceId,
      scheduledDate: new Date(date),
      status: { $nin: ['cancelled', 'refunded'] },
    }).select('scheduledTime');

    // Generate all possible time slots (9 AM to 6 PM, hourly)
    const allSlots = [];
    for (let hour = 9; hour <= 18; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`;
      allSlots.push(time);
    }

    // Remove booked slots
    const bookedTimes = bookings.map(b => b.scheduledTime);
    const availableSlots = allSlots.filter(slot => !bookedTimes.includes(slot));

    return sendSuccess(res, 200, 'Available slots retrieved successfully', {
      availableSlots,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  rescheduleBooking,
  cancelBooking,
  getAvailableSlots,
};
