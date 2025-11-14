const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  image: {
    type: String, // URL
    required: true,
  },
  link: {
    type: String,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
  impressionCount: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

// Indexes
bannerSchema.index({ isActive: 1, displayOrder: 1 });

const Banner = mongoose.model('Banner', bannerSchema);

module.exports = Banner;
