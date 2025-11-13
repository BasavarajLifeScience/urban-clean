const Notification = require('../models/Notification');
const NotificationSettings = require('../models/NotificationSettings');
const logger = require('../utils/logger');

/**
 * Create notification for user
 */
const createNotification = async (userId, type, title, body, data = {}) => {
  try {
    // Check user's notification settings
    const settings = await NotificationSettings.findOne({ userId });

    if (settings && !settings.enabledTypes[type]) {
      logger.info(`Notification type ${type} disabled for user ${userId}`);
      return null;
    }

    // Create notification
    const notification = await Notification.create({
      userId,
      type,
      title,
      body,
      data,
    });

    // TODO: Send push notification if enabled
    // if (settings && settings.pushEnabled) {
    //   await sendPushNotification(userId, title, body, data);
    // }

    // TODO: Send email notification if enabled
    // if (settings && settings.emailEnabled) {
    //   await sendEmailNotification(userId, title, body);
    // }

    // TODO: Send SMS notification if enabled
    // if (settings && settings.smsEnabled) {
    //   await sendSMSNotification(userId, body);
    // }

    return notification;
  } catch (error) {
    logger.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Create booking notification
 */
const notifyBookingCreated = async (booking, resident) => {
  return await createNotification(
    resident._id,
    'booking',
    'Booking Confirmed',
    `Your booking #${booking.bookingNumber} has been confirmed for ${booking.scheduledDate.toDateString()}`,
    { bookingId: booking._id }
  );
};

/**
 * Notify booking assigned to Sevak
 */
const notifyBookingAssigned = async (booking, sevak) => {
  return await createNotification(
    sevak._id,
    'booking',
    'New Job Assigned',
    `You have been assigned a new job for ${booking.scheduledDate.toDateString()} at ${booking.scheduledTime}`,
    { bookingId: booking._id }
  );
};

/**
 * Notify booking status change
 */
const notifyBookingStatusChange = async (booking, userId, status) => {
  const statusMessages = {
    'assigned': 'Your booking has been assigned to a service provider',
    'in-progress': 'Your service has started',
    'completed': 'Your service has been completed',
    'cancelled': 'Your booking has been cancelled',
  };

  return await createNotification(
    userId,
    'booking',
    'Booking Status Update',
    statusMessages[status] || 'Your booking status has been updated',
    { bookingId: booking._id, status }
  );
};

/**
 * Notify payment success
 */
const notifyPaymentSuccess = async (payment, userId) => {
  return await createNotification(
    userId,
    'payment',
    'Payment Successful',
    `Your payment of ₹${payment.amount} has been processed successfully`,
    { paymentId: payment._id }
  );
};

/**
 * Notify payment failed
 */
const notifyPaymentFailed = async (payment, userId) => {
  return await createNotification(
    userId,
    'payment',
    'Payment Failed',
    `Your payment of ₹${payment.amount} could not be processed. Please try again.`,
    { paymentId: payment._id }
  );
};

/**
 * Get user notifications
 */
const getUserNotifications = async (userId, options = {}) => {
  const { page = 1, limit = 20, isRead } = options;
  const skip = (page - 1) * limit;

  const query = { userId };
  if (isRead !== undefined) {
    query.isRead = isRead;
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(query);
  const unreadCount = await Notification.countDocuments({ userId, isRead: false });

  return {
    notifications,
    unreadCount,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Mark notification as read
 */
const markAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  return notification;
};

/**
 * Mark all notifications as read
 */
const markAllAsRead = async (userId) => {
  await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  return { success: true };
};

module.exports = {
  createNotification,
  notifyBookingCreated,
  notifyBookingAssigned,
  notifyBookingStatusChange,
  notifyPaymentSuccess,
  notifyPaymentFailed,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
};
