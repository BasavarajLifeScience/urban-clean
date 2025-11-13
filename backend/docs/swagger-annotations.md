# Swagger API Documentation Guide

## Current Status

✅ **Completed:**
- Swagger UI installed and configured
- Authentication endpoints documented (7 endpoints)
- Available at: http://localhost:5001/api-docs

## Remaining Endpoints to Document

### User Endpoints (2)
```javascript
/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               address:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
```

### Service Endpoints (5)
```javascript
/**
 * @swagger
 * /services:
 *   get:
 *     summary: Browse all services
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 */

/**
 * @swagger
 * /services/categories:
 *   get:
 *     summary: Get all service categories
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */

/**
 * @swagger
 * /services/{serviceId}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *       404:
 *         description: Service not found
 */

/**
 * @swagger
 * /services/favorites:
 *   post:
 *     summary: Add service to favorites
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Added to favorites
 */

/**
 * @swagger
 * /services/user/favorites:
 *   get:
 *     summary: Get user's favorite services
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 */
```

### Booking Endpoints (6)
```javascript
/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - scheduledDate
 *               - scheduledTime
 *               - address
 *             properties:
 *               serviceId:
 *                 type: string
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *               scheduledTime:
 *                 type: string
 *               address:
 *                 type: object
 *     responses:
 *       201:
 *         description: Booking created successfully
 */

/**
 * @swagger
 * /bookings/my-bookings:
 *   get:
 *     summary: Get user's bookings
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 */

/**
 * @swagger
 * /bookings/available-slots:
 *   get:
 *     summary: Get available time slots
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Available slots retrieved
 */

/**
 * @swagger
 * /bookings/{bookingId}:
 *   get:
 *     summary: Get booking details
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       403:
 *         description: Permission denied
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /bookings/{bookingId}/reschedule:
 *   patch:
 *     summary: Reschedule a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newDate:
 *                 type: string
 *                 format: date
 *               newTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking rescheduled successfully
 */

/**
 * @swagger
 * /bookings/{bookingId}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 */
```

### Sevak Endpoints (9)
```javascript
/**
 * @swagger
 * /sevak/jobs:
 *   get:
 *     summary: Get sevak's assigned jobs
 *     tags: [Sevak]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Jobs retrieved successfully
 */

/**
 * @swagger
 * /sevak/earnings:
 *   get:
 *     summary: Get sevak's earnings
 *     tags: [Sevak]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings retrieved successfully
 */

/**
 * @swagger
 * /sevak/performance:
 *   get:
 *     summary: Get sevak's performance metrics
 *     tags: [Sevak]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance metrics retrieved
 */

/**
 * @swagger
 * /sevak/feedback:
 *   get:
 *     summary: Get sevak's feedback
 *     tags: [Sevak]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feedback retrieved successfully
 */

/**
 * @swagger
 * /sevak/attendance:
 *   get:
 *     summary: Get sevak's attendance
 *     tags: [Sevak]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance retrieved successfully
 */
```

### Payment Endpoints (4)
```javascript
/**
 * @swagger
 * /payments/history:
 *   get:
 *     summary: Get payment history
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment history retrieved
 */

/**
 * @swagger
 * /payments/create-order:
 *   post:
 *     summary: Create Razorpay payment order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Order created successfully
 *       500:
 *         description: Payment gateway not configured
 */
```

### Rating Endpoints (4)
```javascript
/**
 * @swagger
 * /ratings:
 *   post:
 *     summary: Create a rating for completed booking
 *     tags: [Ratings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookingId:
 *                 type: string
 *               ratedTo:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rating created successfully
 *       400:
 *         description: Can only rate completed bookings
 */

/**
 * @swagger
 * /ratings/sevak/{sevakId}:
 *   get:
 *     summary: Get ratings for a sevak
 *     tags: [Ratings]
 *     parameters:
 *       - in: path
 *         name: sevakId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ratings retrieved successfully
 */
```

### Notification Endpoints (4)
```javascript
/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */

/**
 * @swagger
 * /notifications/read-all:
 *   patch:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */

/**
 * @swagger
 * /notifications/settings:
 *   get:
 *     summary: Get notification settings
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 */
```

## Quick Implementation Guide

Copy the Swagger annotations from this file and paste them directly above the corresponding `router.METHOD()` lines in each route file:

1. `backend/src/routes/user.routes.js` - User endpoints
2. `backend/src/routes/service.routes.js` - Service endpoints
3. `backend/src/routes/booking.routes.js` - Booking endpoints
4. `backend/src/routes/sevak.routes.js` - Sevak endpoints
5. `backend/src/routes/payment.routes.js` - Payment endpoints
6. `backend/src/routes/rating.routes.js` - Rating endpoints
7. `backend/src/routes/notification.routes.js` - Notification endpoints

After adding annotations, restart the backend and visit:
- http://localhost:5001/api-docs

The Swagger UI will automatically pick up all documented endpoints!
