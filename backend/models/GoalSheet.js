const mongoose = require('mongoose');

const goalSheetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  financialYear: {
    type: String,
    required: true,
    default: '2026-2027'
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Returned', 'Approved'],
    default: 'Draft'
  },
  isLocked: {
    type: Boolean,
    default: false
  },
  submittedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Reverse populate with virtuals to get goals linked to this sheet
goalSheetSchema.virtual('goals', {
  ref: 'Goal',
  localField: '_id',
  foreignField: 'goalSheetId',
  justOne: false
});

module.exports = mongoose.model('GoalSheet', goalSheetSchema);
