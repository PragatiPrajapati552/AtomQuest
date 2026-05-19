const User = require('../models/User');
const GoalSheet = require('../models/GoalSheet');

// @desc    Get manager's team
// @route   GET /api/users/team
// @access  Private (Manager)
exports.getTeam = async (req, res) => {
  try {
    const team = await User.find({ managerId: req.user.id });
    
    // Also fetch their goal sheets
    const teamWithSheets = await Promise.all(team.map(async (member) => {
      const sheet = await GoalSheet.findOne({ userId: member._id, financialYear: '2026-2027' }).populate('goals');
      return {
        ...member._doc,
        goalSheet: sheet || null
      };
    }));

    res.status(200).json({ success: true, data: teamWithSheets });
  } catch (err) {
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().populate('managerId', 'name');
    
    const usersWithSheets = await Promise.all(users.map(async (user) => {
      const sheet = await GoalSheet.findOne({ userId: user._id, financialYear: '2026-2027' }).populate('goals');
      return {
        ...user._doc,
        goalSheet: sheet || null
      };
    }));

    res.status(200).json({ success: true, data: usersWithSheets });
  } catch (err) {
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  
  }
};
