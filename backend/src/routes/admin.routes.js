const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { isAdmin, hasPermission, isSuperAdmin } = require('../middleware/admin.middleware');
const {
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
} = require('../controllers/admin.controller');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

/**
 * Dashboard routes
 */
router.get('/dashboard/overview', hasPermission('analytics:view'), getDashboardOverview);

/**
 * Sevak management routes
 */
router.get('/sevaks', hasPermission('users:view'), getAllSevaks);
router.get('/sevaks/:sevakId', hasPermission('users:view'), getSevakDetails);
router.put('/sevaks/:sevakId/verify', hasPermission('users:approve'), verifySevakDocument);
router.put('/sevaks/:sevakId/toggle-active', hasPermission('users:edit'), toggleSevakActive);
router.post('/sevaks/:sevakId/blacklist', hasPermission('users:edit'), blacklistSevak);
router.put('/sevaks/:sevakId/reinstate', hasPermission('users:edit'), reinstateSevak);

/**
 * Booking management routes
 */
router.get('/bookings', hasPermission('bookings:view'), getAllBookings);
router.put('/bookings/:bookingId/assign-sevak', hasPermission('bookings:edit'), assignSevakToBooking);

/**
 * Analytics routes
 */
router.get('/analytics/revenue', hasPermission('analytics:view'), getRevenueAnalytics);
router.get('/analytics/sevak-performance', hasPermission('analytics:view'), getSevakPerformance);

/**
 * Platform settings routes (super admin only)
 */
router.get('/settings', isSuperAdmin, getPlatformSettings);
router.put('/settings', isSuperAdmin, updatePlatformSettings);

/**
 * Offers management routes
 */
router.get('/offers', hasPermission('content:view'), getAllOffers);
router.post('/offers', hasPermission('content:create'), createOffer);

/**
 * Notifications routes
 */
router.post('/notifications/broadcast', hasPermission('notifications:create'), sendBroadcast);

module.exports = router;
