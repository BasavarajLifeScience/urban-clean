const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  platformName: {
    type: String,
    default: 'Society Booking',
  },
  supportEmail: {
    type: String,
  },
  supportPhone: {
    type: String,
  },
  commissionRate: {
    type: Number, // percentage
    default: 10,
  },
  cancellationWindowHours: {
    type: Number,
    default: 24,
  },
  refundProcessingDays: {
    type: Number,
    default: 7,
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  maintenanceMessage: {
    type: String,
  },
  features: {
    enableRatings: {
      type: Boolean,
      default: true,
    },
    enableReferrals: {
      type: Boolean,
      default: false,
    },
    enableWallet: {
      type: Boolean,
      default: false,
    },
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);

module.exports = PlatformSettings;
