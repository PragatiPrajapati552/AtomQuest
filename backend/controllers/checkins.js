const CheckIn = require('../models/CheckIn');
const GoalSheet = require('../models/GoalSheet');

// @desc    Add a structured quarterly check-in comment
// @route   POST /api/checkins
// @access  Private (Manager)
exports.createCheckIn = async (req, res) => {
  try {
    const { goalSheetId, quarter, comments } = req.body;

    const sheet = await GoalSheet.findById(goalSheetId).populate('userId');
    if (!sheet) {
      return res.status(404).json({ success: false, error: 'Goal sheet not found' });
    }

    // Verify manager is authorized for this employee
    if (sheet.userId.managerId?.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized for this employee' });
    }

    const checkIn = await CheckIn.create({
      goalSheetId,
      managerId: req.user.id,
      quarter,
      comments
    });

    res.status(201).json({ success: true, data: checkIn });
  } catch (err) {
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  
  }
};

// @desc    Get check-ins for a goal sheet
// @route   GET /api/checkins/:sheetId
// @access  Private
exports.getCheckIns = async (req, res) => {
  try {
    const checkIns = await CheckIn.find({ goalSheetId: req.params.sheetId }).sort('-createdAt');
    res.status(200).json({ success: true, data: checkIns });
  } catch (err) {
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  
  }
};
