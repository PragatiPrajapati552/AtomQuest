const GoalSheet = require('../models/GoalSheet');
const Goal = require('../models/Goal');

// @desc    Get user's current goal sheet
// @route   GET /api/goalsheets
// @access  Private
exports.getGoalSheet = async (req, res) => {
  try {
    const goalSheet = await GoalSheet.findOne({ userId: req.user.id }).populate('goals');
    
    if (!goalSheet) {
      return res.status(404).json({ success: false, error: 'No goal sheet found' });
    }

    res.status(200).json({ success: true, data: goalSheet });
  } catch (err) {
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  
  }
};

exports.createGoalSheet = async (req, res) => {
  try {
    const { goals, status = 'Submitted' } = req.body;

    if (!goals || !Array.isArray(goals) || goals.length === 0) {
      return res.status(400).json({ success: false, error: 'Please provide at least one goal in an array' });
    }

    if (goals.length > 8) {
      return res.status(400).json({ success: false, error: 'Maximum 8 goals allowed' });
    }

    let totalWeight = 0;
    for (let i = 0; i < goals.length; i++) {
      // For Submit: enforce all required fields
      if (status === 'Submitted') {
        if (!goals[i].title || !goals[i].description || !goals[i].thrustArea || !goals[i].uom || goals[i].weightage === undefined) {
          return res.status(400).json({ success: false, error: `Goal #${i + 1} is missing required fields` });
        }
        if (goals[i].weightage < 10) {
          return res.status(400).json({ success: false, error: `Goal #${i + 1} must have minimum 10% weightage` });
        }
      } else {
        // For Draft: only require title to identify the goal
        if (!goals[i].title) {
          return res.status(400).json({ success: false, error: `Goal #${i + 1} must have at least a title` });
        }
      }
      totalWeight += Number(goals[i].weightage) || 0;
    }

    if (status === 'Submitted' && totalWeight !== 100) {
      return res.status(400).json({ success: false, error: 'Total weightage must be exactly 100%' });
    }

    let goalSheet = await GoalSheet.findOne({ userId: req.user.id, financialYear: '2026-2027' });

    if (goalSheet) {
      if (goalSheet.status === 'Approved' || goalSheet.isLocked) {
        return res.status(400).json({ success: false, error: 'Goal sheet is already locked' });
      } else {
        // Remove old goals and overwrite
        await Goal.deleteMany({ goalSheetId: goalSheet._id });
        goalSheet.status = status;
        if (status === 'Submitted') goalSheet.submittedAt = Date.now();
        await goalSheet.save();
      }
    } else {
      goalSheet = await GoalSheet.create({
        userId: req.user.id,
        financialYear: '2026-2027',
        status: status,
        submittedAt: status === 'Submitted' ? Date.now() : null
      });
      await goalSheet.save();
    }

    // Strip frontend-only fields and sanitize before inserting to DB
    const goalsToInsert = goals.map(g => {
      const { isSaved, _id, id, ...cleanGoal } = g;
      return {
        ...cleanGoal,
        goalSheetId: goalSheet._id,
        // Convert empty string target to undefined so Mongoose Number type doesn't fail
        target: cleanGoal.target === '' || cleanGoal.target === null ? undefined : Number(cleanGoal.target) || undefined,
        weightage: Number(cleanGoal.weightage) || 10
      };
    });

    await Goal.insertMany(goalsToInsert, { ordered: false });

    const populatedSheet = await GoalSheet.findById(goalSheet._id).populate('goals');

    res.status(201).json({ success: true, data: populatedSheet });
  } catch (err) {
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  
  }
};


// @desc    Approve or Return Goal Sheet
// @route   PUT /api/goalsheets/:id/approve
// @access  Private (Manager)
exports.approveGoalSheet = async (req, res) => {
  try {
    const { status, inlineEdits } = req.body; // inlineEdits is array of { goalId, weightage, target }

    const goalSheet = await GoalSheet.findById(req.params.id);

    if (!goalSheet) {
      return res.status(404).json({ success: false, error: 'Goal sheet not found' });
    }

    // Apply inline edits if any
    if (inlineEdits && Array.isArray(inlineEdits) && inlineEdits.length > 0) {
      // Prevent IDOR by verifying the goal belongs to this goal sheet
      const validGoals = await Goal.find({ goalSheetId: goalSheet._id });
      const validGoalIds = validGoals.map(g => g._id.toString());

      for (let edit of inlineEdits) {
        if (!edit.goalId || !validGoalIds.includes(edit.goalId.toString())) {
          return res.status(403).json({ success: false, error: `Goal ${edit.goalId} does not belong to this goal sheet` });
        }
        await Goal.findByIdAndUpdate(edit.goalId, {
          weightage: edit.weightage,
          target: edit.target
        });
      }
      
      // Need to validate total weightage again if manager edited
      const allGoals = await Goal.find({ goalSheetId: goalSheet._id });
      const totalWeight = allGoals.reduce((sum, g) => sum + Number(g.weightage || 0), 0);
      if (totalWeight !== 100 && status === 'Approved') {
        return res.status(400).json({ success: false, error: 'Total weightage after manager edits must be 100%' });
      }
    }

    if (status === 'Approved') {
      goalSheet.status = 'Approved';
      goalSheet.isLocked = true;
      goalSheet.approvedAt = Date.now();
      goalSheet.approvedBy = req.user.id;
    } else if (status === 'Returned') {
      goalSheet.status = 'Returned';
      goalSheet.isLocked = false;
    }

    await goalSheet.save();

    res.status(200).json({ success: true, data: goalSheet });
  } catch (err) {
    
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages.join(', ') });
    }
    res.status(500).json({ success: false, error: 'Server Error' });
  
  }
};
