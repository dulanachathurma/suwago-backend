const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getReminders,
  createReminder,
  toggleReminder,
  deleteReminder,
} = require('../controllers/reminderController');

router.use(protect);
router.route('/').get(getReminders).post(createReminder);
router.route('/:id').put(toggleReminder).delete(deleteReminder);

module.exports = router;
