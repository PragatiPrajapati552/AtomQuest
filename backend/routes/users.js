const express = require('express');
const { getTeam, getUsers } = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/team', authorize('manager'), getTeam);
router.get('/', authorize('admin'), getUsers);

module.exports = router;
