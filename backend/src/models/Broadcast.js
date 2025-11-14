const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  targetAudience: {
    type: String,
    enum: ['all', 'residents', 'sevaks', 'vendors', 'custom'],
    required: true,
  },
  targetUserIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Admin
  },
  recipientCount: {
    type: Number,
    default: 0,
  },
  deliveredCount: {
    type: Number,
    default: 0,
  },
  readCount: {
    type: Number,
    default: 0,
  },
  scheduledAt: {
    type: Date,
  },
  sentAt: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent', 'cancelled'],
    default: 'draft',
  },
}, {
  timestamps: true,
});

// Indexes
broadcastSchema.index({ status: 1, createdAt: -1 });
broadcastSchema.index({ sentBy: 1 });

const Broadcast = mongoose.model('Broadcast', broadcastSchema);

module.exports = Broadcast;
