const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const paymentController = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const validate = require('../middleware/validate.middleware');

// All routes require authentication
router.use(authenticate);

// Validation
const createOrderValidation = [
  body('bookingId').notEmpty().withMessage('Booking ID is required'),
  body('amount').isNumeric().withMessage('Valid amount is required'),
];

const verifyPaymentValidation = [
  body('razorpayOrderId').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpayPaymentId').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpaySignature').notEmpty().withMessage('Razorpay signature is required'),
];

// Routes
router.post('/create-order', createOrderValidation, validate, asyncHandler(paymentController.createPaymentOrder));
router.post('/verify', verifyPaymentValidation, validate, asyncHandler(paymentController.verifyPaymentController));
router.get('/invoice/:bookingId', asyncHandler(paymentController.getInvoice));
router.get('/history', asyncHandler(paymentController.getPaymentHistory));
router.post('/refund', asyncHandler(paymentController.refundPayment));

module.exports = router;
