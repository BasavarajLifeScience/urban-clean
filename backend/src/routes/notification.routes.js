const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');

// All routes require authentication
router.use(authenticate);

// Routes
router.get('/', asyncHandler(notificationController.getNotifications));
router.patch('/:notificationId/read', asyncHandler(notificationController.markNotificationAsRead));
router.patch('/read-all', asyncHandler(notificationController.markAllNotificationsAsRead));
router.get('/settings', asyncHandler(notificationController.getNotificationSettings));
router.put('/settings', asyncHandler(notificationController.updateNotificationSettings));

module.exports = router;
