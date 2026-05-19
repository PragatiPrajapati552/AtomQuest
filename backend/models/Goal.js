const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  goalSheetId: {
    type: mongoose.Schema.ObjectId,
    ref: 'GoalSheet',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a goal title']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  thrustArea: {
    type: String,
    required: [true, 'Please select a thrust area']
  },
  uom: {
    type: String,
    enum: ['Numeric', '%', 'Timeline', 'Zero-based'],
    required: true
  },
  target: {
    type: Number,
    required: function() {
      // Timeline might use a different field, but we can store timestamp here or use target for all
      return this.uom !== 'Timeline';
    }
  },
  targetDate: {
    type: Date,
    required: function() {
      return this.uom === 'Timeline';
    }
  },
  weightage: {
    type: Number,
    required: true,
    min: 10,
    max: 100
  },
  isShared: {
    type: Boolean,
    default: false
  },
  // Phase 2: Achievements
  q1: {
    actual: { type: Number },
    status: { type: String, enum: ['Not Started', 'On Track', 'Completed'], default: 'Not Started' }
  },
  q2: {
    actual: { type: Number },
    status: { type: String, enum: ['Not Started', 'On Track', 'Completed'], default: 'Not Started' }
  },
  q3: {
    actual: { type: Number },
    status: { type: String, enum: ['Not Started', 'On Track', 'Completed'], default: 'Not Started' }
  },
  q4: {
    actual: { type: Number },
    status: { type: String, enum: ['Not Started', 'On Track', 'Completed'], default: 'Not Started' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);
