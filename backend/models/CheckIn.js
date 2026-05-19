const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema({
  goalSheetId: {
    type: mongoose.Schema.ObjectId,
    ref: 'GoalSheet',
    required: true
  },
  managerId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  quarter: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4', 'Annual'],
    required: true
  },
  comments: {
    type: String,
    required: [true, 'Please provide structured check-in comments']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CheckIn', checkInSchema);
