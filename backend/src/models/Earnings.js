const mongoose = require('mongoose');

const earningsSchema = new mongoose.Schema({
  sevakId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  commission: {
    type: Number,
    default: 0,
  },
  netAmount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processed', 'paid'],
    default: 'pending',
  },
  paidAt: Date,
  paymentMethod: String,
  transactionId: String,
}, {
  timestamps: true,
});

// Indexes
earningsSchema.index({ sevakId: 1, status: 1 });
earningsSchema.index({ sevakId: 1, createdAt: -1 });
earningsSchema.index({ bookingId: 1 });

const Earnings = mongoose.model('Earnings', earningsSchema);

module.exports = Earnings;
