const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
  },
  complainantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  against: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  complaintType: {
    type: String,
    enum: ['poor-service', 'unprofessional', 'no-show', 'fraud', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  evidence: [{
    type: String, // URLs to images/documents
  }],
  status: {
    type: String,
    enum: ['pending', 'investigating', 'resolved', 'dismissed'],
    default: 'pending',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin investigating
  },
  resolutionNotes: {
    type: String,
  },
  actionTaken: {
    type: String,
  },
  resolvedAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

// Indexes
complaintSchema.index({ against: 1, status: 1 });
complaintSchema.index({ complainantId: 1 });
complaintSchema.index({ createdAt: -1 });

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;
