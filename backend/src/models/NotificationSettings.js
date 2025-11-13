const mongoose = require('mongoose');

const notificationSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  pushEnabled: {
    type: Boolean,
    default: true,
  },
  emailEnabled: {
    type: Boolean,
    default: true,
  },
  smsEnabled: {
    type: Boolean,
    default: true,
  },
  enabledTypes: {
    booking: {
      type: Boolean,
      default: true,
    },
    payment: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Boolean,
      default: true,
    },
    offer: {
      type: Boolean,
      default: true,
    },
    system: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

// Indexes
notificationSettingsSchema.index({ userId: 1 });

const NotificationSettings = mongoose.model('NotificationSettings', notificationSettingsSchema);

module.exports = NotificationSettings;
