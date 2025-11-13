const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true,
    unique: true, // One rating per booking
  },
  ratedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Sevak/Vendor being rated
  },
  ratedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true, // Resident giving the rating
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    maxlength: 500,
  },
  isReported: {
    type: Boolean,
    default: false,
  },
  reportReason: String,
}, {
  timestamps: true,
});

// Indexes
ratingSchema.index({ ratedTo: 1 });
ratingSchema.index({ ratedBy: 1 });
// Note: bookingId already has a unique index from schema definition
ratingSchema.index({ rating: -1 });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
