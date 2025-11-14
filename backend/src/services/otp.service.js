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
    console.log('🔍 [OTP Service] Verifying OTP with params:', {
      userId,
      otpCode,
      type,
    });

    // Check all OTPs for this user to help debug
    const allUserOTPs = await OTP.find({ userId });
    console.log('📋 [OTP Service] All OTPs for user:', allUserOTPs.map(o => ({
      otp: o.otp,
      type: o.type,
      isUsed: o.isUsed,
      expiresAt: o.expiresAt,
      isValid: o.isValid(),
    })));

    const otp = await OTP.findOne({
      userId,
      otp: otpCode,
      type,
      isUsed: false,
    });

    if (!otp) {
      console.error('❌ [OTP Service] No matching OTP found in database');
      return { valid: false, message: 'Invalid OTP' };
    }

    console.log('✅ [OTP Service] OTP found:', {
      otp: otp.otp,
      type: otp.type,
      isUsed: otp.isUsed,
      expiresAt: otp.expiresAt,
    });

    if (!otp.isValid()) {
      console.error('❌ [OTP Service] OTP expired');
      return { valid: false, message: 'OTP expired' };
    }

    // Mark OTP as used
    otp.isUsed = true;
    await otp.save();

    console.log('✅ [OTP Service] OTP verified and marked as used');

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
