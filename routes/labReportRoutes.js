const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getReports, uploadReport, deleteReport } = require('../controllers/labReportController');

router.use(protect);
router.route('/').get(getReports).post(uploadReport);
router.route('/:id').delete(deleteReport);

module.exports = router;
