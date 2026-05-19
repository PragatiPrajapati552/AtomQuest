const express = require('express');
const { getGoalSheet, createGoalSheet, approveGoalSheet } = require('../controllers/goalsheets');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getGoalSheet)
  .post(authorize('employee'), createGoalSheet);

router.route('/:id/approve')
  .put(authorize('manager', 'admin'), approveGoalSheet);

module.exports = router;
