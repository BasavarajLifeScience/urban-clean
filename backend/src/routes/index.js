const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const serviceRoutes = require('./service.routes');
const bookingRoutes = require('./booking.routes');
const paymentRoutes = require('./payment.routes');
const ratingRoutes = require('./rating.routes');
const sevakRoutes = require('./sevak.routes');
const notificationRoutes = require('./notification.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/services', serviceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/ratings', ratingRoutes);
router.use('/sevak', sevakRoutes);
router.use('/notifications', notificationRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
