const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const { authLimiter, otpLimiter, passwordResetLimiter } = require('../middleware/rateLimit.middleware');

// Validation rules
const registerValidation = [
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('role').isIn(['resident', 'sevak', 'vendor']).withMessage('Invalid role'),
  body('fullName').notEmpty().withMessage('Full name is required'),
];

const verifyOTPValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
];

const loginValidation = [
  body('phoneOrEmail').notEmpty().withMessage('Phone or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

const forgotPasswordValidation = [
  body('phoneOrEmail').notEmpty().withMessage('Phone or email is required'),
];

const resetPasswordValidation = [
  body('userId').notEmpty().withMessage('User ID is required'),
  body('otp').notEmpty().withMessage('OTP is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const adminLoginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  body('adminCode').notEmpty().withMessage('Admin code is required'),
];

// Routes
router.post('/register', authLimiter, registerValidation, validate, asyncHandler(authController.register));
router.post('/verify-otp', otpLimiter, verifyOTPValidation, validate, asyncHandler(authController.verifyOTPController));
router.post('/login', authLimiter, loginValidation, validate, asyncHandler(authController.login));
router.post('/admin-login', authLimiter, adminLoginValidation, validate, asyncHandler(authController.adminLogin));
router.post('/refresh-token', refreshTokenValidation, validate, asyncHandler(authController.refreshAccessToken));
router.post('/forgot-password', passwordResetLimiter, forgotPasswordValidation, validate, asyncHandler(authController.forgotPassword));
router.post('/reset-password', passwordResetLimiter, resetPasswordValidation, validate, asyncHandler(authController.resetPassword));
router.post('/logout', asyncHandler(authController.logout));

module.exports = router;
