const express = require('express');
const { updateAchievement, pushSharedGoals } = require('../controllers/goals');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/:id/achievement')
  .put(authorize('employee'), updateAchievement);

router.route('/shared')
  .post(authorize('manager', 'admin'), pushSharedGoals);

module.exports = router;
