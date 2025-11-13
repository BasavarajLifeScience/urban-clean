const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  sevakId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  issueType: {
    type: String,
    enum: ['damage', 'missing-materials', 'access-denied', 'safety-concern', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  images: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['reported', 'acknowledged', 'resolved'],
    default: 'reported',
  },
  resolution: String,
  resolvedAt: Date,
}, {
  timestamps: true,
});

// Indexes
issueSchema.index({ bookingId: 1 });
issueSchema.index({ sevakId: 1, status: 1 });

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
