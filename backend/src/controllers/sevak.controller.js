const Booking = require('../models/Booking');
const Earnings = require('../models/Earnings');
const Issue = require('../models/Issue');
const Rating = require('../models/Rating');
const { sendSuccess, sendPaginated } = require('../utils/response.utils');
const { getPagination } = require('../utils/helpers');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');
const { notifyBookingStatusChange } = require('../services/notification.service');

/**
 * Get Sevak jobs/bookings
 */
const getJobs = async (req, res, next) => {
  try {
    const sevakId = req.user.userId;
    const { date, status, page, limit } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    const query = { sevakId };

    if (status) {
      query.status = status;
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      query.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
    }

    const jobs = await Booking.find(query)
      .populate('serviceId', '_id name category basePrice')
      .populate('residentId', '_id fullName phoneNumber')
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    // Get counts for today and upcoming
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = await Booking.countDocuments({
      sevakId,
      scheduledDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
    });

    const upcomingCount = await Booking.countDocuments({
      sevakId,
      scheduledDate: { $gt: new Date() },
      status: { $in: ['pending', 'assigned'] },
    });

    return sendSuccess(res, 200, 'Jobs retrieved successfully', {
      jobs,
      todayCount,
      upcomingCount,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get job details
 */
const getJobDetails = async (req, res, next) => {
  try {
    const sevakId = req.user.userId.toString(); // Convert ObjectId to string for comparison
    const { jobId } = req.params;

    const job = await Booking.findById(jobId)
      .populate('serviceId')
      .populate('residentId', '_id fullName phoneNumber email');

    if (!job) {
      throw new NotFoundError('Job not found');
    }

    if (job.sevakId.toString() !== sevakId) {
      throw new ForbiddenError('You do not have permission to view this job');
    }

    return sendSuccess(res, 200, 'Job details retrieved successfully', {
      job,
      resident: job.residentId,
      service: job.serviceId,
      checkInOTP: job.checkInOTP,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check-in to job
 */
const checkIn = async (req, res, next) => {
  try {
    const sevakId = req.user.userId.toString(); // Convert ObjectId to string for comparison
    const { bookingId, otp, location } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.sevakId.toString() !== sevakId) {
      throw new ForbiddenError('You are not assigned to this booking');
    }

    if (booking.checkInOTP !== otp) {
      throw new ValidationError('Invalid OTP');
    }

    if (booking.status !== 'assigned') {
      throw new ValidationError('Booking is not in assigned state');
    }

    // Update booking
    booking.status = 'in-progress';
    booking.checkInTime = new Date();
    booking.timeline.push({
      status: 'in-progress',
      timestamp: new Date(),
      notes: 'Sevak checked in',
    });

    await booking.save();

    // Notify resident
    await notifyBookingStatusChange(booking, booking.residentId, 'in-progress');

    return sendSuccess(res, 200, 'Checked in successfully', {
      booking,
      checkedInAt: booking.checkInTime,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check-out from job
 */
const checkOut = async (req, res, next) => {
  try {
    const sevakId = req.user.userId.toString(); // Convert ObjectId to string for comparison
    const { bookingId, location } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.sevakId.toString() !== sevakId) {
      throw new ForbiddenError('You are not assigned to this booking');
    }

    if (booking.status !== 'in-progress') {
      throw new ValidationError('Booking is not in progress');
    }

    // Update booking
    booking.checkOutTime = new Date();
    const duration = Math.round((booking.checkOutTime - booking.checkInTime) / (1000 * 60)); // in minutes

    booking.timeline.push({
      status: 'checked-out',
      timestamp: new Date(),
      notes: `Sevak checked out. Duration: ${duration} minutes`,
    });

    await booking.save();

    return sendSuccess(res, 200, 'Checked out successfully', {
      booking,
      checkedOutAt: booking.checkOutTime,
      duration,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete job
 */
const completeJob = async (req, res, next) => {
  try {
    const sevakId = req.user.userId.toString(); // Convert ObjectId to string for comparison
    const { bookingId } = req.params;
    const { completionNotes, checklistItems } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.sevakId.toString() !== sevakId) {
      throw new ForbiddenError('You are not assigned to this booking');
    }

    // Handle file uploads (only if files are actually uploaded)
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const beforeImages = req.files.filter(f => f.fieldname === 'beforeImages')
        .map(f => `/uploads/job-photos/${f.filename}`);
      const afterImages = req.files.filter(f => f.fieldname === 'afterImages')
        .map(f => `/uploads/job-photos/${f.filename}`);

      if (beforeImages.length > 0) {
        booking.beforeImages = beforeImages;
      }
      if (afterImages.length > 0) {
        booking.afterImages = afterImages;
      }
    }

    // Update booking
    booking.status = 'completed';
    booking.completionNotes = completionNotes;
    booking.timeline.push({
      status: 'completed',
      timestamp: new Date(),
      notes: 'Job completed by Sevak',
    });

    await booking.save();

    // Create earnings record
    const commission = booking.totalAmount * 0.1; // 10% commission
    const netAmount = booking.totalAmount - commission;

    await Earnings.create({
      sevakId,
      bookingId: booking._id,
      amount: booking.totalAmount,
      commission,
      netAmount,
      status: 'pending',
    });

    // Notify resident
    await notifyBookingStatusChange(booking, booking.residentId, 'completed');

    return sendSuccess(res, 200, 'Job completed successfully', { booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Report issue
 */
const reportIssue = async (req, res, next) => {
  try {
    const sevakId = req.user.userId.toString(); // Convert ObjectId to string for comparison
    const { bookingId } = req.params;
    const { issueType, description } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.sevakId.toString() !== sevakId) {
      throw new ForbiddenError('You are not assigned to this booking');
    }

    // Handle file uploads
    const images = req.files ? req.files.map(f => `/uploads/job-photos/${f.filename}`) : [];

    // Create issue
    const issue = await Issue.create({
      bookingId,
      sevakId,
      issueType,
      description,
      images,
    });

    // Add to booking's reported issues
    booking.reportedIssues.push(issue._id);
    await booking.save();

    return sendSuccess(res, 201, 'Issue reported successfully', { issue });
  } catch (error) {
    next(error);
  }
};

/**
 * Get earnings
 */
const getEarnings = async (req, res, next) => {
  try {
    const sevakId = req.user.userId;
    const { period, startDate, endDate } = req.query;

    let dateFilter = {};

    if (period === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dateFilter = { $gte: today };
    } else if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      dateFilter = { $gte: weekAgo };
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { $gte: monthAgo };
    } else if (startDate && endDate) {
      dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const query = { sevakId };
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    const earnings = await Earnings.find(query)
      .populate('bookingId', 'bookingNumber scheduledDate')
      .sort({ createdAt: -1 });

    const totalEarnings = earnings.reduce((sum, e) => sum + e.netAmount, 0);

    return sendSuccess(res, 200, 'Earnings retrieved successfully', {
      totalEarnings,
      breakdown: earnings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get performance metrics
 */
const getPerformance = async (req, res, next) => {
  try {
    const sevakId = req.user.userId;

    // Get ratings
    const ratings = await Rating.find({ ratedTo: sevakId });
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    // Get total jobs
    const totalJobs = await Booking.countDocuments({ sevakId });
    const completedJobs = await Booking.countDocuments({ sevakId, status: 'completed' });
    const completionRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    // Calculate on-time percentage (mock for POC)
    const onTimePercentage = 95;

    return sendSuccess(res, 200, 'Performance metrics retrieved successfully', {
      averageRating: Math.round(averageRating * 10) / 10,
      totalRatings: ratings.length,
      completionRate: Math.round(completionRate),
      onTimePercentage,
      totalJobs,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get feedback/reviews
 */
const getFeedback = async (req, res, next) => {
  try {
    const sevakId = req.user.userId;
    const { page, limit } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    const feedback = await Rating.find({ ratedTo: sevakId })
      .populate('ratedBy', 'fullName')
      .populate('bookingId', 'bookingNumber scheduledDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Rating.countDocuments({ ratedTo: sevakId });
    const averageRating = feedback.length > 0
      ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length
      : 0;

    return sendSuccess(res, 200, 'Feedback retrieved successfully', {
      feedback,
      averageRating: Math.round(averageRating * 10) / 10,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get attendance history
 */
const getAttendance = async (req, res, next) => {
  try {
    const sevakId = req.user.userId;
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        scheduledDate: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    const attendance = await Booking.find({
      sevakId,
      ...dateFilter,
      status: { $in: ['completed', 'in-progress'] },
    })
      .select('scheduledDate checkInTime checkOutTime status')
      .sort({ scheduledDate: -1 });

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.checkInTime).length;

    return sendSuccess(res, 200, 'Attendance retrieved successfully', {
      attendance,
      totalDays,
      presentDays,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available jobs (unassigned bookings)
 */
const getAvailableJobs = async (req, res, next) => {
  try {
    const sevakId = req.user.userId.toString();
    const { page, limit, category } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    // Query for unassigned bookings
    const query = {
      $or: [
        { sevakId: null },
        { sevakId: { $exists: false } }
      ],
      status: 'pending',
      scheduledDate: { $gte: new Date() } // Only future bookings
    };

    // Filter by category if provided
    if (category) {
      const Service = require('../models/Service');
      const services = await Service.find({ category }).select('_id');
      query.serviceId = { $in: services.map(s => s._id) };
    }

    const jobs = await Booking.find(query)
      .populate('serviceId', '_id name category basePrice description')
      .populate('residentId', '_id fullName phoneNumber')
      .sort({ scheduledDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    console.log(`📋 [Sevak] Available jobs for sevak ${sevakId}:`, jobs.length);

    return sendSuccess(res, 200, 'Available jobs retrieved successfully', {
      jobs,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept an available job
 */
const acceptJob = async (req, res, next) => {
  try {
    const sevakId = req.user.userId.toString();
    const { jobId } = req.params;

    console.log(`🎯 [Sevak] Attempting to accept job ${jobId} by sevak ${sevakId}`);

    const booking = await Booking.findById(jobId)
      .populate('serviceId')
      .populate('residentId', '_id fullName phoneNumber');

    if (!booking) {
      throw new NotFoundError('Job not found');
    }

    console.log('📋 [Sevak] Booking found:', {
      bookingId: booking._id,
      residentId: booking.residentId,
      currentSevakId: booking.sevakId,
      status: booking.status,
    });

    // Check if job is still available
    if (booking.sevakId) {
      throw new ValidationError('This job has already been assigned to another sevak');
    }

    if (booking.status !== 'pending') {
      throw new ValidationError('This job is no longer available');
    }

    // Check if scheduled date is in the future
    if (new Date(booking.scheduledDate) < new Date()) {
      throw new ValidationError('Cannot accept jobs scheduled in the past');
    }

    // Assign the job to this sevak
    booking.sevakId = sevakId;
    booking.status = 'assigned';
    booking.timeline.push({
      status: 'assigned',
      timestamp: new Date(),
      notes: 'Job accepted by sevak',
    });
    await booking.save();

    // Create notification for resident
    const Notification = require('../models/Notification');
    const residentUserId = booking.residentId._id || booking.residentId;

    console.log('📬 [Sevak] Creating notification for resident:', residentUserId);

    await Notification.create({
      userId: residentUserId,
      type: 'booking',
      title: 'Sevak Assigned',
      body: `A service provider has been assigned to your booking #${booking.bookingNumber}`,
      data: { bookingId: booking._id },
    });

    console.log(`✅ [Sevak] Job ${jobId} accepted by sevak ${sevakId}`);

    return sendSuccess(res, 200, 'Job accepted successfully', { booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getJobs,
  getJobDetails,
  checkIn,
  checkOut,
  completeJob,
  reportIssue,
  getEarnings,
  getPerformance,
  getFeedback,
  getAttendance,
  getAvailableJobs,
  acceptJob,
};
