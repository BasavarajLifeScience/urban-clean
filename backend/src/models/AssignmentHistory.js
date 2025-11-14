const mongoose = require('mongoose');

const assignmentHistorySchema = new mongoose.Schema({
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
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Admin
  },
  assignmentType: {
    type: String,
    enum: ['auto', 'manual', 'reassignment'],
    required: true,
  },
  previousSevakId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // For reassignments
  },
  reason: {
    type: String,
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
assignmentHistorySchema.index({ bookingId: 1 });
assignmentHistorySchema.index({ sevakId: 1 });
assignmentHistorySchema.index({ createdAt: -1 });

const AssignmentHistory = mongoose.model('AssignmentHistory', assignmentHistorySchema);

module.exports = AssignmentHistory;
