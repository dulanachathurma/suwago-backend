const Review = require('../models/Review');

// GET /api/reviews/doctor/:doctorId
const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const reviews = await Review.find({ doctorId }).sort({ createdAt: -1 });
    let avgRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
      avgRating = parseFloat((sum / reviews.length).toFixed(1));
    }

    res.json({ status: 'success', reviews, avgRating, count: reviews.length });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

// POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { doctorId, rating, reviewText } = req.body;
    if (!doctorId || !rating || !reviewText) {
      return res.status(400).json({ code: 'INVALID_INPUT', message: 'doctorId, rating, and reviewText are required' });
    }

    const review = await Review.create({
      userId: req.user._id,
      userName: req.user.name || 'Patient',
      doctorId,
      rating: Number(rating),
      reviewText,
    });

    res.status(201).json({ status: 'success', review });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: err.message });
  }
};

module.exports = {
  getDoctorReviews,
  createReview,
};
