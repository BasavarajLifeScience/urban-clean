const { getUserNotifications, markAsRead, markAllAsRead } = require('../services/notification.service');
const NotificationSettings = require('../models/NotificationSettings');
const { sendSuccess } = require('../utils/response.utils');
const { NotFoundError } = require('../utils/errors');

/**
 * Get user notifications
 */
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { page, limit, isRead } = req.query;

    const result = await getUserNotifications(userId, {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
      isRead: isRead !== undefined ? isRead === 'true' : undefined,
    });

    return sendSuccess(res, 200, 'Notifications retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 */
const markNotificationAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { notificationId } = req.params;

    const notification = await markAsRead(notificationId, userId);

    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    return sendSuccess(res, 200, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await markAllAsRead(userId);

    return sendSuccess(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Get notification settings
 */
const getNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    let settings = await NotificationSettings.findOne({ userId });

    if (!settings) {
      // Create default settings if not exists
      settings = await NotificationSettings.create({ userId });
    }

    return sendSuccess(res, 200, 'Notification settings retrieved successfully', { settings });
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification settings
 */
const updateNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { pushEnabled, emailEnabled, smsEnabled, enabledTypes } = req.body;

    const settings = await NotificationSettings.findOneAndUpdate(
      { userId },
      {
        pushEnabled,
        emailEnabled,
        smsEnabled,
        enabledTypes,
      },
      { new: true, upsert: true }
    );

    return sendSuccess(res, 200, 'Notification settings updated successfully', { settings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationSettings,
  updateNotificationSettings,
};
