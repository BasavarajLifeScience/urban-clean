const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
  },
  subcategory: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    default: '',
  },
  images: [{
    type: String,
  }],
  basePrice: {
    type: Number,
    required: [true, 'Base price is required'],
    min: 0,
  },
  priceUnit: {
    type: String,
    default: 'per service', // 'per hour', 'per sqft', etc.
  },
  duration: {
    type: Number, // in minutes
    default: 60,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  tags: [{
    type: String,
  }],
  features: [{
    type: String,
  }],
  faqs: [{
    question: String,
    answer: String,
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  bookingCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes for better query performance
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ name: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ averageRating: -1 });
serviceSchema.index({ basePrice: 1 });

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
