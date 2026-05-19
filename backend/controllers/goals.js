const Goal = require('../models/Goal');
const GoalSheet = require('../models/GoalSheet');
const AuditLog = require('../models/AuditLog');

// @desc    Update quarterly achievement for a goal
// @route   PUT /api/goals/:id/achievement
// @access  Private (Employee)
exports.updateAchievement = async (req, res) => {
  try {
    const { quarter, actual, status } = req.body; // quarter: q1, q2, q3, q4

    if (!['q1', 'q2', 'q3', 'q4'].includes(quarter)) {
      return res.status(400).json({ success: false, error: 'Invalid quarter specified' });
    }

    let goal = await Goal.findById(req.params.id).populate('goalSheetId');

    if (!goal) {
      return res.status(404).json({ success: false, error: 'Goal not found' });
    }

    // Make sure user owns the goal sheet
    if (goal.goalSheetId.userId.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
    }

    if (!goal.goalSheetId.isLocked) {
      return res.status(400).json({ success: false, error: 'Goal sheet must be approved before updating achievements' });
    }

    goal[quarter].actual = actual;
    goal[quarter].status = status;

    await goal.save();

    res.status(200).json({ success: true, data: goal });
  } catch (err) {
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  
  }
};

// @desc    Push shared goals to multiple employees
// @route   POST /api/goals/shared
// @access  Private (Manager/Admin)
exports.pushSharedGoals = async (req, res) => {
  try {
    const { userIds, title, description, thrustArea, uom, target } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide an array of userIds' });
    }

    const addedGoals = [];

    for (let userId of userIds) {
      let sheet = await GoalSheet.findOne({ userId, financialYear: '2026-2027' });
      if (sheet && !sheet.isLocked) {
        // Can only push if sheet is not locked (or depending on org policy, admin could force it)
        const newGoal = await Goal.create({
          goalSheetId: sheet._id,
          title,
          description,
          thrustArea,
          uom,
          target,
          weightage: 10, // Default weightage, employee has to adjust later
          isShared: true
        });
        addedGoals.push(newGoal);
      }
    }

    res.status(201).json({ success: true, data: addedGoals });
  } catch (err) {
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  
  }
};
