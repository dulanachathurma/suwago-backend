const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking,
} = require('../controllers/bookingController');

router.use(protect);
router.route('/').get(getBookings).post(createBooking);
router.route('/:id/status').patch(updateBookingStatus);
router.route('/:id').delete(deleteBooking);

module.exports = router;
