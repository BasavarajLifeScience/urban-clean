const mongoose = require('mongoose');

const blacklistRecordSchema = new mongoose.Schema({
  sevakId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  blacklistedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['temporary', 'permanent'],
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  detailedNotes: {
    type: String,
  },
  duration: {
    type: Number, // days, for temporary blacklist
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date, // for temporary blacklist
  },
  relatedComplaints: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
  }],
  // Reinstatement
  isActive: {
    type: Boolean,
    default: true,
  },
  reinstatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reinstatementReason: {
    type: String,
  },
  reinstatedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
blacklistRecordSchema.index({ sevakId: 1, isActive: 1 });
blacklistRecordSchema.index({ createdAt: -1 });

const BlacklistRecord = mongoose.model('BlacklistRecord', blacklistRecordSchema);

module.exports = BlacklistRecord;
