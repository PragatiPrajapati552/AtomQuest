const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  goalSheetId: {
    type: mongoose.Schema.ObjectId,
    ref: 'GoalSheet',
    required: true
  },
  modifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
