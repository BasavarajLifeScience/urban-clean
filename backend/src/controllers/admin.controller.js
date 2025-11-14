const User = require('../models/User');
const Profile = require('../models/Profile');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Category = require('../models/Category');
const Payment = require('../models/Payment');
const Rating = require('../models/Rating');
const Admin = require('../models/Admin');
const Complaint = require('../models/Complaint');
const BlacklistRecord = require('../models/BlacklistRecord');
const Offer = require('../models/Offer');
const Banner = require('../models/Banner');
const PlatformSettings = require('../models/PlatformSettings');
const AssignmentHistory = require('../models/AssignmentHistory');
const Broadcast = require('../models/Broadcast');
const Notification = require('../models/Notification');
const { sendSuccess } = require('../utils/response.utils');
const { NotFoundError, ValidationError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Get dashboard overview statistics
 */
const getDashboardOverview = async (req, res, next) => {
  try {
    // Get counts
    const [
      totalUsers,
      totalResidents,
      totalSevaks,
      totalVendors,
      activeSevaks,
      verifiedSevaks,
      blacklistedSevaks,
      totalBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalServices,
      activeServices,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'resident' }),
      User.countDocuments({ role: 'sevak' }),
      User.countDocuments({ role: 'vendor' }),
      User.countDocuments({ role: 'sevak', isActive: true }),
      User.countDocuments({ role: 'sevak', isVerified: true }),
      User.countDocuments({ role: 'sevak', isBlacklisted: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
      Service.countDocuments(),
      Service.countDocuments({ isActive: true }),
    ]);

    // Get revenue stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [todayRevenue, thisMonthRevenue, lastMonthRevenue] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'success', createdAt: { $gte: today } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'success', createdAt: { $gte: thisMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        {
          $match: {
            status: 'success',
            createdAt: { $gte: lastMonth, $lt: thisMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    const todayRev = todayRevenue[0]?.total || 0;
    const thisMonthRev = thisMonthRevenue[0]?.total || 0;
    const lastMonthRev = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = lastMonthRev > 0
      ? ((thisMonthRev - lastMonthRev) / lastMonthRev * 100).toFixed(2)
      : 0;

    // Get today's and this month's bookings
    const todayBookings = await Booking.countDocuments({ createdAt: { $gte: today } });
    const thisMonthBookings = await Booking.countDocuments({ createdAt: { $gte: thisMonth } });

    return sendSuccess(res, 200, 'Dashboard overview retrieved successfully', {
      statistics: {
        users: {
          total: totalUsers,
          residents: { total: totalResidents },
          sevaks: {
            total: totalSevaks,
            active: activeSevaks,
            verified: verifiedSevaks,
            blacklisted: blacklistedSevaks,
          },
          vendors: { total: totalVendors },
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          today: todayBookings,
          thisMonth: thisMonthBookings,
        },
        services: {
          total: totalServices,
          active: activeServices,
        },
        revenue: {
          today: todayRev,
          thisMonth: thisMonthRev,
          lastMonth: lastMonthRev,
          growth: parseFloat(revenueGrowth),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all sevaks with filters
 */
const getAllSevaks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      isVerified,
      isBlacklisted,
      search
    } = req.query;

    const query = { role: 'sevak' };

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    if (isBlacklisted !== undefined) query.isBlacklisted = isBlacklisted === 'true';

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [sevaks, totalCount] = await Promise.all([
      User.find(query)
        .select('-password')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Sevaks retrieved successfully', {
      sevaks,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sevak details by ID
 */
const getSevakDetails = async (req, res, next) => {
  try {
    const { sevakId } = req.params;

    const sevak = await User.findOne({ _id: sevakId, role: 'sevak' }).select('-password');

    if (!sevak) {
      throw new NotFoundError('Sevak not found');
    }

    const [profile, bookings, ratings, earnings, blacklistHistory] = await Promise.all([
      Profile.findOne({ userId: sevakId }),
      Booking.find({ sevak: sevakId }).sort({ createdAt: -1 }).limit(10),
      Rating.find({ ratedTo: sevakId }).sort({ createdAt: -1 }).limit(10),
      Payment.aggregate([
        {
          $lookup: {
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'booking'
          }
        },
        { $unwind: '$booking' },
        { $match: { 'booking.sevak': sevak._id, status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      BlacklistRecord.find({ sevakId, isActive: true }),
    ]);

    const totalEarnings = earnings[0]?.total || 0;

    return sendSuccess(res, 200, 'Sevak details retrieved successfully', {
      sevak,
      profile,
      bookings,
      ratings,
      totalEarnings,
      blacklistHistory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify sevak document
 */
const verifySevakDocument = async (req, res, next) => {
  try {
    const { sevakId } = req.params;
    const { documentId, status, notes } = req.body;

    const profile = await Profile.findOne({ userId: sevakId });

    if (!profile) {
      throw new NotFoundError('Profile not found');
    }

    const document = profile.documents.id(documentId);

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    document.verificationStatus = status;
    document.verificationNotes = notes;
    document.verifiedBy = req.user.userId;
    document.verifiedAt = new Date();

    await profile.save();

    return sendSuccess(res, 200, 'Document verified successfully', { document });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle sevak active status
 */
const toggleSevakActive = async (req, res, next) => {
  try {
    const { sevakId } = req.params;
    const { isActive, reason } = req.body;

    const sevak = await User.findOne({ _id: sevakId, role: 'sevak' });

    if (!sevak) {
      throw new NotFoundError('Sevak not found');
    }

    sevak.isActive = isActive;
    await sevak.save();

    logger.info(`Sevak ${sevakId} active status changed to ${isActive} by admin ${req.user.userId}. Reason: ${reason}`);

    return sendSuccess(res, 200, 'Sevak status updated successfully', { sevak });
  } catch (error) {
    next(error);
  }
};

/**
 * Blacklist a sevak
 */
const blacklistSevak = async (req, res, next) => {
  try {
    const { sevakId } = req.params;
    const { reason, type, duration, notes, relatedComplaints } = req.body;

    const sevak = await User.findOne({ _id: sevakId, role: 'sevak' });

    if (!sevak) {
      throw new NotFoundError('Sevak not found');
    }

    // Update user blacklist status
    sevak.isBlacklisted = true;
    sevak.blacklistReason = reason;
    sevak.blacklistedAt = new Date();
    sevak.blacklistedBy = req.user.userId;
    await sevak.save();

    // Create blacklist record
    const endDate = type === 'temporary' && duration
      ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000)
      : null;

    const blacklistRecord = await BlacklistRecord.create({
      sevakId,
      blacklistedBy: req.user.userId,
      type,
      reason,
      detailedNotes: notes,
      duration,
      endDate,
      relatedComplaints: relatedComplaints || [],
    });

    logger.info(`Sevak ${sevakId} blacklisted by admin ${req.user.userId}. Type: ${type}, Reason: ${reason}`);

    return sendSuccess(res, 200, 'Sevak blacklisted successfully', {
      sevak,
      blacklistRecord,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reinstate a blacklisted sevak
 */
const reinstateSevak = async (req, res, next) => {
  try {
    const { sevakId } = req.params;
    const { reason, notes } = req.body;

    const sevak = await User.findOne({ _id: sevakId, role: 'sevak' });

    if (!sevak) {
      throw new NotFoundError('Sevak not found');
    }

    if (!sevak.isBlacklisted) {
      throw new ValidationError('Sevak is not blacklisted');
    }

    // Update user
    sevak.isBlacklisted = false;
    sevak.blacklistReason = null;
    sevak.blacklistedAt = null;
    sevak.blacklistedBy = null;
    await sevak.save();

    // Update blacklist record
    await BlacklistRecord.updateMany(
      { sevakId, isActive: true },
      {
        $set: {
          isActive: false,
          reinstatedBy: req.user.userId,
          reinstatementReason: reason,
          reinstatedAt: new Date(),
        },
      }
    );

    logger.info(`Sevak ${sevakId} reinstated by admin ${req.user.userId}. Reason: ${reason}`);

    return sendSuccess(res, 200, 'Sevak reinstated successfully', { sevak });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings with filters
 */
const getAllBookings = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      dateFrom,
      dateTo,
      sevakId,
      residentId,
    } = req.query;

    const query = {};

    if (status) query.status = status;
    if (sevakId) query.sevak = sevakId;
    if (residentId) query.resident = residentId;

    if (dateFrom || dateTo) {
      query.scheduledDate = {};
      if (dateFrom) query.scheduledDate.$gte = new Date(dateFrom);
      if (dateTo) query.scheduledDate.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [bookings, totalCount] = await Promise.all([
      Booking.find(query)
        .populate('resident', 'fullName email phoneNumber')
        .populate('sevak', 'fullName email phoneNumber')
        .populate('service', 'name basePrice')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Booking.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Bookings retrieved successfully', {
      bookings,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Assign sevak to booking
 */
const assignSevakToBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { sevakId, notes } = req.body;

    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    const sevak = await User.findOne({ _id: sevakId, role: 'sevak' });

    if (!sevak) {
      throw new NotFoundError('Sevak not found');
    }

    if (sevak.isBlacklisted) {
      throw new ValidationError('Cannot assign blacklisted sevak');
    }

    const previousSevakId = booking.sevak;

    booking.sevak = sevakId;
    booking.assignedBy = req.user.userId;
    booking.status = 'assigned';
    await booking.save();

    // Create assignment history
    await AssignmentHistory.create({
      bookingId,
      sevakId,
      assignedBy: req.user.userId,
      assignmentType: previousSevakId ? 'reassignment' : 'manual',
      previousSevakId,
      notes,
    });

    // Send notification to sevak
    await Notification.create({
      userId: sevakId,
      type: 'job',
      title: 'New Job Assigned',
      message: `You have been assigned to booking #${booking.bookingNumber}`,
      data: { bookingId: booking._id },
    });

    logger.info(`Booking ${bookingId} assigned to sevak ${sevakId} by admin ${req.user.userId}`);

    return sendSuccess(res, 200, 'Sevak assigned successfully', { booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue analytics
 */
const getRevenueAnalytics = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, groupBy = 'day' } = req.query;

    const matchStage = { status: 'success' };

    if (dateFrom || dateTo) {
      matchStage.createdAt = {};
      if (dateFrom) matchStage.createdAt.$gte = new Date(dateFrom);
      if (dateTo) matchStage.createdAt.$lte = new Date(dateTo);
    }

    // Group by format
    let groupFormat;
    switch (groupBy) {
      case 'week':
        groupFormat = { $week: '$createdAt' };
        break;
      case 'month':
        groupFormat = { $month: '$createdAt' };
        break;
      default:
        groupFormat = { $dayOfYear: '$createdAt' };
    }

    const [totalRevenue, revenueByPeriod, revenueByService] = await Promise.all([
      Payment.aggregate([
        { $match: matchStage },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Payment.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: groupFormat,
            revenue: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Payment.aggregate([
        { $match: matchStage },
        {
          $lookup: {
            from: 'bookings',
            localField: 'bookingId',
            foreignField: '_id',
            as: 'booking',
          },
        },
        { $unwind: '$booking' },
        {
          $lookup: {
            from: 'services',
            localField: 'booking.service',
            foreignField: '_id',
            as: 'service',
          },
        },
        { $unwind: '$service' },
        {
          $group: {
            _id: '$service._id',
            serviceName: { $first: '$service.name' },
            revenue: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
    ]);

    const total = totalRevenue[0]?.total || 0;
    const transactionCount = totalRevenue[0]?.count || 0;
    const averageOrderValue = transactionCount > 0 ? total / transactionCount : 0;

    return sendSuccess(res, 200, 'Revenue analytics retrieved successfully', {
      totalRevenue: total,
      transactionCount,
      averageOrderValue,
      revenueByPeriod,
      revenueByService,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get sevak performance analytics
 */
const getSevakPerformance = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, sevakId, limit = 10 } = req.query;

    const matchStage = { role: 'sevak' };
    if (sevakId) matchStage._id = sevakId;

    const sevaks = await User.find(matchStage).select('fullName email');

    const performance = await Promise.all(
      sevaks.map(async (sevak) => {
        const bookingMatch = { sevak: sevak._id };

        if (dateFrom || dateTo) {
          bookingMatch.createdAt = {};
          if (dateFrom) bookingMatch.createdAt.$gte = new Date(dateFrom);
          if (dateTo) bookingMatch.createdAt.$lte = new Date(dateTo);
        }

        const [bookingStats, ratingStats] = await Promise.all([
          Booking.aggregate([
            { $match: bookingMatch },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ]),
          Rating.aggregate([
            { $match: { ratedTo: sevak._id } },
            {
              $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalRatings: { $sum: 1 },
              },
            },
          ]),
        ]);

        const totalJobs = bookingStats.reduce((sum, s) => sum + s.count, 0);
        const completedJobs = bookingStats.find(s => s._id === 'completed')?.count || 0;
        const cancelledJobs = bookingStats.find(s => s._id === 'cancelled')?.count || 0;

        return {
          sevakId: sevak._id,
          name: sevak.fullName,
          email: sevak.email,
          totalJobs,
          completedJobs,
          cancelledJobs,
          averageRating: ratingStats[0]?.averageRating || 0,
          totalRatings: ratingStats[0]?.totalRatings || 0,
          completionRate: totalJobs > 0 ? (completedJobs / totalJobs * 100).toFixed(2) : 0,
          cancellationRate: totalJobs > 0 ? (cancelledJobs / totalJobs * 100).toFixed(2) : 0,
        };
      })
    );

    const sortedPerformance = performance.sort((a, b) => b.completedJobs - a.completedJobs);

    return sendSuccess(res, 200, 'Sevak performance retrieved successfully', {
      sevaks: sortedPerformance.slice(0, parseInt(limit)),
      topPerformers: sortedPerformance.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create or update platform settings
 */
const updatePlatformSettings = async (req, res, next) => {
  try {
    const settings = await PlatformSettings.findOneAndUpdate(
      {},
      { ...req.body, updatedBy: req.user.userId },
      { new: true, upsert: true }
    );

    return sendSuccess(res, 200, 'Platform settings updated successfully', { settings });
  } catch (error) {
    next(error);
  }
};

/**
 * Get platform settings
 */
const getPlatformSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne();

    if (!settings) {
      settings = await PlatformSettings.create({});
    }

    return sendSuccess(res, 200, 'Platform settings retrieved successfully', { settings });
  } catch (error) {
    next(error);
  }
};

/**
 * Create offer
 */
const createOffer = async (req, res, next) => {
  try {
    const offer = await Offer.create({
      ...req.body,
      createdBy: req.user.userId,
    });

    return sendSuccess(res, 201, 'Offer created successfully', { offer });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all offers
 */
const getAllOffers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = {};
    if (status === 'active') {
      query.isActive = true;
      query.validFrom = { $lte: new Date() };
      query.validTo = { $gte: new Date() };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [offers, totalCount] = await Promise.all([
      Offer.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Offer.countDocuments(query),
    ]);

    return sendSuccess(res, 200, 'Offers retrieved successfully', {
      offers,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send broadcast notification
 */
const sendBroadcast = async (req, res, next) => {
  try {
    const { title, message, targetAudience, userIds } = req.body;

    // Determine recipients
    let recipients = [];
    if (targetAudience === 'custom' && userIds) {
      recipients = userIds;
    } else if (targetAudience !== 'all') {
      const users = await User.find({ role: targetAudience }).select('_id');
      recipients = users.map(u => u._id);
    } else {
      const users = await User.find({ role: { $in: ['resident', 'sevak', 'vendor'] } }).select('_id');
      recipients = users.map(u => u._id);
    }

    // Create broadcast record
    const broadcast = await Broadcast.create({
      title,
      message,
      targetAudience,
      targetUserIds: targetAudience === 'custom' ? userIds : undefined,
      sentBy: req.user.userId,
      recipientCount: recipients.length,
      status: 'sent',
      sentAt: new Date(),
    });

    // Create notifications for all recipients
    const notifications = recipients.map(userId => ({
      userId,
      type: 'admin-broadcast',
      title,
      message,
      isBroadcast: true,
      sentBy: req.user.userId,
      data: { broadcastId: broadcast._id },
    }));

    await Notification.insertMany(notifications);

    broadcast.deliveredCount = recipients.length;
    await broadcast.save();

    logger.info(`Broadcast sent by admin ${req.user.userId} to ${recipients.length} users`);

    return sendSuccess(res, 200, 'Broadcast sent successfully', {
      broadcast,
      recipientCount: recipients.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardOverview,
  getAllSevaks,
  getSevakDetails,
  verifySevakDocument,
  toggleSevakActive,
  blacklistSevak,
  reinstateSevak,
  getAllBookings,
  assignSevakToBooking,
  getRevenueAnalytics,
  getSevakPerformance,
  updatePlatformSettings,
  getPlatformSettings,
  createOffer,
  getAllOffers,
  sendBroadcast,
};
