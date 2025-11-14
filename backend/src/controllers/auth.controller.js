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
  logger.info('🎯 [Auth Controller] Registration request received');
  logger.info(`📋 [Auth Controller] Request data: ${JSON.stringify({
    phoneNumber: req.body.phoneNumber,
    email: req.body.email,
    role: req.body.role,
    fullName: req.body.fullName,
    hasPassword: !!req.body.password,
  })}`);

  try {
    const { phoneNumber, email, password, role, fullName } = req.body;

    logger.info(`🔍 [Auth Controller] Checking for existing user with email: ${email} or phone: ${phoneNumber}`);

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { phoneNumber }] });

    if (existingUser) {
      logger.warn(`⚠️ [Auth Controller] User already exists - email: ${email}, phone: ${phoneNumber}`);
      throw new ConflictError('User already exists with this email or phone number');
    }

    logger.info('✅ [Auth Controller] No existing user found, creating new user...');

    // Create user
    const user = await User.create({
      phoneNumber,
      email,
      password,
      role,
      fullName,
    });

    logger.info(`✅ [Auth Controller] User created successfully with ID: ${user._id}`);

    // Create empty profile
    await Profile.create({ userId: user._id });
    logger.info(`✅ [Auth Controller] Profile created for user: ${user._id}`);

    // Create notification settings with defaults
    await NotificationSettings.create({ userId: user._id });
    logger.info(`✅ [Auth Controller] Notification settings created for user: ${user._id}`);

    // Generate OTP
    const { otp } = await createOTP(user._id, 'registration');

    logger.info(`✅ [Auth Controller] User registered successfully: ${user._id}, OTP: ${otp}`);
    logger.info(`📤 [Auth Controller] Sending success response for user: ${user._id}`);

    return sendSuccess(res, 201, 'User registered successfully. OTP sent for verification.', {
      userId: user._id,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    logger.error('❌ [Auth Controller] Registration error:', error.message);
    logger.error('❌ [Auth Controller] Error stack:', error.stack);
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
 * Admin login with admin code
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password, adminCode } = req.body;

    // Find user with admin role
    const user = await User.findOne({ email, role: 'admin' }).select('+password');

    if (!user) {
      throw new UnauthorizedError('Invalid admin credentials');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid admin credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Admin account is disabled');
    }

    // Verify admin code
    const Admin = require('../models/Admin');
    const adminProfile = await Admin.findOne({ userId: user._id, adminCode });

    if (!adminProfile) {
      throw new UnauthorizedError('Invalid admin code');
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

    return sendSuccess(res, 200, 'Admin login successful', {
      accessToken,
      refreshToken,
      user: user.toPublicJSON(),
      admin: {
        adminCode: adminProfile.adminCode,
        isSuperAdmin: adminProfile.isSuperAdmin,
        department: adminProfile.department,
        permissions: adminProfile.permissions,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Delete refresh token
      await RefreshToken.deleteOne({ token: refreshToken });
    }

    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyOTPController,
  login,
  adminLogin,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
  logout,
};
