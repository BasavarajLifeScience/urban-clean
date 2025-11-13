const User = require('../models/User');
const Profile = require('../models/Profile');
const { sendSuccess, sendError } = require('../utils/response.utils');
const { NotFoundError } = require('../utils/errors');
const { calculateProfileCompletion } = require('../utils/helpers');

/**
 * Get user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    const profile = await Profile.findOne({ userId });

    if (!user || !profile) {
      throw new NotFoundError('Profile not found');
    }

    return sendSuccess(res, 200, 'Profile retrieved successfully', {
      user: user.toPublicJSON(),
      profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const updateData = req.body;

    // Get user to determine role
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update profile
    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // Calculate profile completion
    const completionPercentage = calculateProfileCompletion(profile, user.role);
    profile.profileCompletionPercentage = completionPercentage;
    await profile.save();

    // Update user's isProfileComplete flag
    user.isProfileComplete = completionPercentage === 100;
    await user.save();

    return sendSuccess(res, 200, 'Profile updated successfully', {
      profile,
      isComplete: user.isProfileComplete,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload profile documents
 */
const uploadDocuments = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    if (!req.files || req.files.length === 0) {
      throw new ValidationError('No files uploaded');
    }

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      throw new NotFoundError('Profile not found');
    }

    // Add documents to profile
    const documents = req.files.map(file => ({
      type: req.body.documentType || 'other',
      url: `/uploads/documents/${file.filename}`,
      verificationStatus: 'pending',
      uploadedAt: new Date(),
    }));

    profile.documents.push(...documents);
    await profile.save();

    return sendSuccess(res, 200, 'Documents uploaded successfully', {
      documents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete profile document
 */
const deleteDocument = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { documentId } = req.params;

    const profile = await Profile.findOne({ userId });

    if (!profile) {
      throw new NotFoundError('Profile not found');
    }

    // Remove document
    profile.documents = profile.documents.filter(doc => doc._id.toString() !== documentId);
    await profile.save();

    return sendSuccess(res, 200, 'Document deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  uploadDocuments,
  deleteDocument,
};
