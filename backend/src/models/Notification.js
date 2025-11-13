const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['booking', 'payment', 'rating', 'offer', 'system'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  data: {
    type: mongoose.Schema.Types.Mixed, // Additional metadata
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  // For push notifications
  pushSent: {
    type: Boolean,
    default: false,
  },
  pushSentAt: Date,
}, {
  timestamps: true,
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
