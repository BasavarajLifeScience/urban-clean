const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  adminCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  permissions: [{
    module: {
      type: String,
      enum: ['users', 'services', 'bookings', 'payments', 'analytics', 'content', 'notifications', 'settings'],
      required: true,
    },
    actions: [{
      type: String,
      enum: ['view', 'create', 'edit', 'delete', 'approve'],
    }],
  }],
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
  department: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for faster queries
adminSchema.index({ userId: 1 });
adminSchema.index({ adminCode: 1 });

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;
