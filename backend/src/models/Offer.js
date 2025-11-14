const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  minOrderValue: {
    type: Number,
  },
  maxDiscount: {
    type: Number,
  },
  validFrom: {
    type: Date,
    required: true,
  },
  validTo: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  applicableServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
  }],
  applicableUserTypes: [{
    type: String,
    enum: ['resident', 'all'],
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
offerSchema.index({ code: 1 });
offerSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });

const Offer = mongoose.model('Offer', offerSchema);

module.exports = Offer;
