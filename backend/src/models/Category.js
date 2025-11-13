const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
  },
  icon: {
    type: String,
    default: '',
  },
  imageUrl: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  displayOrder: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Indexes
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1, displayOrder: 1 });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
