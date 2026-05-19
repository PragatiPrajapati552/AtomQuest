const express = require('express');
const { createCheckIn, getCheckIns } = require('../controllers/checkins');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('manager', 'admin'), createCheckIn);

router.route('/:sheetId')
  .get(getCheckIns);

module.exports = router;
