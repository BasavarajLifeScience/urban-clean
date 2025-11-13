const mongoose = require('mongoose');

const checklistSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  items: [{
    label: {
      type: String,
      required: true,
    },
    isRequired: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  }],
}, {
  timestamps: true,
});

// Indexes
checklistSchema.index({ serviceId: 1 });

const Checklist = mongoose.model('Checklist', checklistSchema);

module.exports = Checklist;
