const OTP = require('../models/OTP');
const { generateOTP } = require('../utils/helpers');
const logger = require('../utils/logger');

/**
 * Generate and save OTP for user
 */
const createOTP = async (userId, type) => {
  try {
    // Generate OTP (use fixed OTP in development)
    const otpCode = process.env.NODE_ENV === 'development'
      ? (process.env.DEV_OTP || '123456')
      : generateOTP(6);

    // Delete any existing OTPs for this user and type
    await OTP.deleteMany({ userId, type });

    // Create new OTP
    const otp = await OTP.create({
      userId,
      otp: otpCode,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    logger.info(`OTP created for user ${userId}: ${otpCode}`);

    return {
      otpId: otp._id,
      otp: otpCode,
    };
  } catch (error) {
    logger.error('Error creating OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP
 */
const verifyOTP = async (userId, otpCode, type) => {
  try {
    const otp = await OTP.findOne({
      userId,
      otp: otpCode,
      type,
      isUsed: false,
    });

    if (!otp) {
      return { valid: false, message: 'Invalid OTP' };
    }

    if (!otp.isValid()) {
      return { valid: false, message: 'OTP expired' };
    }

    // Mark OTP as used
    otp.isUsed = true;
    await otp.save();

    return { valid: true, message: 'OTP verified successfully' };
  } catch (error) {
    logger.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Resend OTP
 */
const resendOTP = async (userId, type) => {
  return await createOTP(userId, type);
};

module.exports = {
  createOTP,
  verifyOTP,
  resendOTP,
};
