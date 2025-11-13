const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  // Razorpay details
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  paymentMethod: String,
  status: {
    type: String,
    enum: ['created', 'pending', 'success', 'failed', 'refunded'],
    default: 'created',
  },
  failureReason: String,
  // Refund details
  refundId: String,
  refundAmount: Number,
  refundStatus: String,
  refundedAt: Date,
}, {
  timestamps: true,
});

// Indexes
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ userId: 1, status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });
paymentSchema.index({ razorpayPaymentId: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
