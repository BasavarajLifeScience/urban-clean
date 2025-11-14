const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const sevakController = require('../controllers/sevak.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const { uploadFields } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');

// All routes require authentication and sevak role
router.use(authenticate);
router.use(authorize('sevak'));

// Validation
const checkInValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
];

const checkOutValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
];

// Routes
router.get('/jobs', asyncHandler(sevakController.getJobs));
router.get('/available-jobs', asyncHandler(sevakController.getAvailableJobs));
router.post('/jobs/:jobId/accept', asyncHandler(sevakController.acceptJob));
router.get('/jobs/:jobId', asyncHandler(sevakController.getJobDetails));
router.post('/check-in', checkInValidation, validate, asyncHandler(sevakController.checkIn));
router.post('/check-out', checkOutValidation, validate, asyncHandler(sevakController.checkOut));

// Job completion with file uploads
router.patch(
  '/jobs/:bookingId/complete',
  uploadFields([
    { name: 'beforeImages', maxCount: 5 },
    { name: 'afterImages', maxCount: 5 }
  ]),
  asyncHandler(sevakController.completeJob)
);

// Issue reporting with file uploads
router.post(
  '/jobs/:bookingId/report-issue',
  uploadFields([{ name: 'issueImages', maxCount: 5 }]),
  asyncHandler(sevakController.reportIssue)
);

// Earnings and performance
router.get('/earnings', asyncHandler(sevakController.getEarnings));
router.get('/performance', asyncHandler(sevakController.getPerformance));
router.get('/feedback', asyncHandler(sevakController.getFeedback));
router.get('/attendance', asyncHandler(sevakController.getAttendance));

module.exports = router;
