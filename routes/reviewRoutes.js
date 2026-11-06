const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getDoctorReviews, createReview } = require('../controllers/reviewController');

router.get('/doctor/:doctorId', getDoctorReviews);
router.post('/', protect, createReview);

module.exports = router;
