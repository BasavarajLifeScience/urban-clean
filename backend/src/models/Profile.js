const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  avatar: {
    type: String,
    default: '',
  },
  // Common fields
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  // Address
  address: {
    flatNumber: String,
    building: String,
    society: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
  },
  // Resident specific
  emergencyContact: {
    name: String,
    phoneNumber: String,
    relationship: String,
  },
  // Sevak specific
  skills: [{
    type: String,
  }],
  experience: {
    type: Number, // in years
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  documents: [{
    type: {
      type: String,
      enum: ['aadhaar', 'pan', 'certificate', 'other'],
    },
    url: String,
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  availability: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    }],
    timeSlots: [String], // ['09:00-12:00', '14:00-18:00']
  },
  // Vendor specific
  businessName: {
    type: String,
    trim: true,
  },
  businessType: {
    type: String,
    trim: true,
  },
  gstNumber: {
    type: String,
    trim: true,
  },
  servicesOffered: [{
    type: String,
  }],
  // Metadata
  profileCompletionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

// Indexes
// Note: userId already has a unique index from schema definition
profileSchema.index({ 'address.society': 1 });
profileSchema.index({ skills: 1 });

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
