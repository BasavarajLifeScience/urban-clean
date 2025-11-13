const User = require('../models/User');
const Profile = require('../models/Profile');
const RefreshToken = require('../models/RefreshToken');
const NotificationSettings = require('../models/NotificationSettings');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt');
const { createOTP, verifyOTP } = require('../services/otp.service');
const { sendSuccess, sendError } = require('../utils/response.utils');
const { UnauthorizedError, NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const logger = require('../utils/logger');

/**
 * Register new user
 */
const register = async (req, res, next) => {
  try {
    const { phoneNumber, email, password, role, fullName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });

    if (existingUser) {
      throw new ConflictError('User already exists with this email or phone number');
    }

    // Create user
    const user = await User.create({
      phoneNumber,
      email,
      password,
      role,
      fullName,
    });

    // Create empty profile
    await Profile.create({ userId: user._id });

    // Create notification settings with defaults
    await NotificationSettings.create({ userId: user._id });

    // Generate OTP
    const { otp } = await createOTP(user._id, 'registration');

    logger.info(`User registered: ${user._id}, OTP: ${otp}`);

    return sendSuccess(res, 201, 'User registered successfully. OTP sent for verification.', {
      userId: user._id,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP
 */
const verifyOTPController = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify OTP
    const verification = await verifyOTP(userId, otp, 'registration');

    if (!verification.valid) {
      throw new ValidationError(verification.message);
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id });

    // Save refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return sendSuccess(res, 200, 'OTP verified successfully', {
      accessToken,
      refreshToken,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login
 */
const login = async (req, res, next) => {
  try {
    const { phoneOrEmail, password } = req.body;

    // Find user
    const user = await User.findOne({
      $or: [{ email: phoneOrEmail }, { phoneNumber: phoneOrEmail }],
    }).select('+password');

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is disabled');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken({ userId: user._id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user._id });

    // Save refresh token
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    return sendSuccess(res, 200, 'Login successful', {
      accessToken,
      refreshToken,
      user: user.toPublicJSON(),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new ValidationError('Refresh token is required');
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Check if token exists in database
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken, userId: decoded.userId });

    if (!tokenDoc) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (tokenDoc.isExpired()) {
      await tokenDoc.deleteOne();
      throw new UnauthorizedError('Refresh token expired');
    }

    // Get user
    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    // Generate new access token
    const accessToken = generateAccessToken({ userId: user._id, email: user.email, role: user.role });

    return sendSuccess(res, 200, 'Token refreshed successfully', {
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Forgot password
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { phoneOrEmail } = req.body;

    // Find user
    const user = await User.findOne({
      $or: [{ email: phoneOrEmail }, { phoneNumber: phoneOrEmail }],
    });

    if (!user) {
      // Don't reveal if user exists or not
      return sendSuccess(res, 200, 'If the account exists, an OTP has been sent');
    }

    // Generate OTP
    const { otp } = await createOTP(user._id, 'password-reset');

    // TODO: Send OTP via SMS/Email
    logger.info(`Password reset OTP for ${user._id}: ${otp}`);

    return sendSuccess(res, 200, 'OTP sent for password reset', {
      userId: user._id,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res, next) => {
  try {
    const { userId, otp, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify OTP
    const verification = await verifyOTP(userId, otp, 'password-reset');

    if (!verification.valid) {
      throw new ValidationError(verification.message);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete all refresh tokens for this user
    await RefreshToken.deleteMany({ userId });

    return sendSuccess(res, 200, 'Password reset successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body || {};

    if (refreshToken) {
      // Delete refresh token (ignore errors if token doesn't exist)
      await RefreshToken.deleteOne({ token: refreshToken }).catch(() => {});
    }

    // Always return success - logout is idempotent
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    // Logout should never fail - just log and return success
    logger.error('Logout error:', error);
    return sendSuccess(res, 200, 'Logged out successfully');
  }
};

module.exports = {
  register,
  verifyOTPController,
  login,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  logout,
};
