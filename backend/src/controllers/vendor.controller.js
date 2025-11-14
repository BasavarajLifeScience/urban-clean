const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Payment = require('../models/Payment');
const Rating = require('../models/Rating');
const { sendSuccess } = require('../utils/response.utils');
const { getPagination } = require('../utils/helpers');
const { NotFoundError, ValidationError, ForbiddenError } = require('../utils/errors');
const { notifyBookingStatusChange } = require('../services/notification.service');

/**
 * Get vendor dashboard statistics
 */
const getDashboard = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;

    // Get all services managed by this vendor
    const services = await Service.find({ vendorId, isActive: true });
    const serviceIds = services.map(s => s._id);

    // Get booking statistics
    const totalBookings = await Booking.countDocuments({
      serviceId: { $in: serviceIds }
    });

    const pendingBookings = await Booking.countDocuments({
      serviceId: { $in: serviceIds },
      status: 'pending'
    });

    const completedBookings = await Booking.countDocuments({
      serviceId: { $in: serviceIds },
      status: 'completed'
    });

    // Get today's bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayBookings = await Booking.countDocuments({
      serviceId: { $in: serviceIds },
      scheduledDate: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) }
    });

    // Calculate total revenue
    const completedBookingsList = await Booking.find({
      serviceId: { $in: serviceIds },
      status: 'completed',
      paymentStatus: 'paid'
    }).select('totalAmount');

    const totalRevenue = completedBookingsList.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Get this month's revenue
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthBookings = await Booking.find({
      serviceId: { $in: serviceIds },
      status: 'completed',
      paymentStatus: 'paid',
      completedAt: { $gte: firstDayOfMonth }
    }).select('totalAmount');

    const monthRevenue = monthBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    // Get recent bookings
    const recentBookings = await Booking.find({
      serviceId: { $in: serviceIds }
    })
      .populate('serviceId', 'name category')
      .populate('residentId', 'fullName phoneNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get average rating across all services
    const ratings = await Rating.find({
      ratedTo: { $in: serviceIds }
    });

    const averageRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    return sendSuccess(res, 200, 'Dashboard data retrieved successfully', {
      statistics: {
        totalServices: services.length,
        totalBookings,
        pendingBookings,
        completedBookings,
        todayBookings,
        totalRevenue,
        monthRevenue,
        averageRating: Math.round(averageRating * 10) / 10,
        totalRatings: ratings.length
      },
      recentBookings,
      activeServices: services.slice(0, 5) // Top 5 active services
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vendor's services
 */
const getServices = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { page, limit, category, isActive } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    const query = { vendorId };

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const services = await Service.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Service.countDocuments(query);

    // Get booking count and revenue for each service
    const servicesWithStats = await Promise.all(
      services.map(async (service) => {
        const bookingCount = await Booking.countDocuments({ serviceId: service._id });
        const completedBookings = await Booking.find({
          serviceId: service._id,
          status: 'completed',
          paymentStatus: 'paid'
        }).select('totalAmount');

        const revenue = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        return {
          ...service.toObject(),
          stats: {
            totalBookings: bookingCount,
            revenue
          }
        };
      })
    );

    return sendSuccess(res, 200, 'Services retrieved successfully', {
      services: servicesWithStats,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get vendor's orders/bookings
 */
const getOrders = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { page, limit, status, startDate, endDate } = req.query;
    const { skip, limit: limitNum, page: pageNum } = getPagination(page, limit);

    // Get vendor's services
    const services = await Service.find({ vendorId }).select('_id');
    const serviceIds = services.map(s => s._id);

    const query = { serviceId: { $in: serviceIds } };

    if (status) {
      query.status = status;
    }

    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Booking.find(query)
      .populate('serviceId', 'name category basePrice imageUrl')
      .populate('residentId', 'fullName phoneNumber email')
      .populate('sevakId', 'fullName phoneNumber')
      .sort({ scheduledDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Booking.countDocuments(query);

    // Get status counts
    const statusCounts = await Booking.aggregate([
      { $match: { serviceId: { $in: serviceIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    return sendSuccess(res, 200, 'Orders retrieved successfully', {
      orders,
      statusCounts: statusCounts.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
      }, {}),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get order details
 */
const getOrderDetails = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { orderId } = req.params;

    const order = await Booking.findById(orderId)
      .populate('serviceId')
      .populate('residentId', 'fullName phoneNumber email')
      .populate('sevakId', 'fullName phoneNumber email');

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Verify the order belongs to vendor's service
    const service = await Service.findById(order.serviceId._id);
    if (!service || service.vendorId.toString() !== vendorId) {
      throw new ForbiddenError('You do not have permission to view this order');
    }

    // Get payment details if exists
    const payment = await Payment.findOne({ bookingId: order._id });

    // Get rating if exists
    const rating = await Rating.findOne({ bookingId: order._id })
      .populate('ratedBy', 'fullName');

    return sendSuccess(res, 200, 'Order details retrieved successfully', {
      order,
      service: order.serviceId,
      resident: order.residentId,
      sevak: order.sevakId,
      payment,
      rating,
      timeline: order.timeline
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get revenue analytics
 */
const getRevenue = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { period, startDate, endDate } = req.query;

    // Get vendor's services
    const services = await Service.find({ vendorId }).select('_id');
    const serviceIds = services.map(s => s._id);

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
    } else if (period === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      dateFilter = { $gte: yearAgo };
    } else if (startDate && endDate) {
      dateFilter = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const query = {
      serviceId: { $in: serviceIds },
      status: 'completed',
      paymentStatus: 'paid'
    };

    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    const bookings = await Booking.find(query)
      .populate('serviceId', 'name category')
      .select('totalAmount createdAt serviceId')
      .sort({ createdAt: -1 });

    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
    const averageOrderValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;

    // Revenue by service
    const revenueByService = {};
    bookings.forEach(booking => {
      const serviceName = booking.serviceId.name;
      if (!revenueByService[serviceName]) {
        revenueByService[serviceName] = 0;
      }
      revenueByService[serviceName] += booking.totalAmount;
    });

    // Revenue trend (by day for last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendBookings = await Booking.find({
      serviceId: { $in: serviceIds },
      status: 'completed',
      paymentStatus: 'paid',
      createdAt: { $gte: thirtyDaysAgo }
    }).select('totalAmount createdAt');

    const dailyRevenue = {};
    trendBookings.forEach(booking => {
      const date = booking.createdAt.toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = 0;
      }
      dailyRevenue[date] += booking.totalAmount;
    });

    return sendSuccess(res, 200, 'Revenue data retrieved successfully', {
      totalRevenue,
      totalOrders: bookings.length,
      averageOrderValue: Math.round(averageOrderValue),
      revenueByService,
      dailyRevenue
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update service
 */
const updateService = async (req, res, next) => {
  try {
    const vendorId = req.user.userId;
    const { serviceId } = req.params;
    const updates = req.body;

    const service = await Service.findById(serviceId);

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    if (service.vendorId.toString() !== vendorId) {
      throw new ForbiddenError('You do not have permission to update this service');
    }

    // Update allowed fields
    const allowedUpdates = ['name', 'description', 'basePrice', 'duration', 'isActive', 'features', 'tags'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        service[field] = updates[field];
      }
    });

    service.updatedAt = new Date();
    await service.save();

    return sendSuccess(res, 200, 'Service updated successfully', { service });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboard,
  getServices,
  getOrders,
  getOrderDetails,
  getRevenue,
  updateService
};
