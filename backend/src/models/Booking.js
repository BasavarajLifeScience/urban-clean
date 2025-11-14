const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true,
    required: true,
  },
  residentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  sevakId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  scheduledDate: {
    type: Date,
    required: true,
  },
  scheduledTime: {
    type: String,
    required: true,
  },
  estimatedDuration: {
    type: Number, // in minutes
    default: 60,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending',
  },
  address: {
    flatNumber: {
      type: String,
      required: true,
    },
    building: String,
    society: String,
    street: String,
    city: String,
    pincode: String,
    landmark: String,
  },
  specialInstructions: {
    type: String,
    maxlength: 500,
  },
  // Pricing
  basePrice: {
    type: Number,
    required: true,
  },
  additionalCharges: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending',
  },
  paymentId: String,
  paymentMethod: String,
  paidAt: Date,
  // Service Execution
  checkInTime: Date,
  checkOutTime: Date,
  checkInOTP: String,
  beforeImages: [String],
  afterImages: [String],
  completionNotes: {
    type: String,
    maxlength: 500,
  },
  reportedIssues: [String],
  // Cancellation
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  cancellationReason: String,
  cancelledAt: Date,
  refundAmount: Number,
  refundStatus: String,
  // Timeline
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
    notes: String,
  }],
}, {
  timestamps: true,
});

// Indexes for better query performance
bookingSchema.index({ residentId: 1, status: 1 });
bookingSchema.index({ sevakId: 1, scheduledDate: 1 });
// Note: bookingNumber already has a unique index from schema definition
bookingSchema.index({ status: 1, scheduledDate: 1 });
bookingSchema.index({ createdAt: -1 });

// Add timeline entry before saving
bookingSchema.pre('save', function(next) {
  // Add initial timeline entry if new booking
  if (this.isNew) {
    this.timeline.push({
      status: 'pending',
      timestamp: new Date(),
      notes: 'Booking created',
    });
  }
  next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
