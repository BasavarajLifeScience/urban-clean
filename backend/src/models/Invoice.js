const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    required: true,
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    description: String,
    quantity: {
      type: Number,
      default: 1,
    },
    rate: Number,
    amount: Number,
  }],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  issuedAt: {
    type: Date,
    default: Date.now,
  },
  dueDate: Date,
  paidAt: Date,
}, {
  timestamps: true,
});

// Indexes
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ bookingId: 1 });
invoiceSchema.index({ userId: 1 });

const Invoice = mongoose.model('Invoice', invoiceSchema);

module.exports = Invoice;
