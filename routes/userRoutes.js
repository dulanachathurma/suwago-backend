const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getProfile, updateProfile, changePassword } = require('../controllers/userController');

const router = express.Router();

router.route('/profile').get(protect, getProfile).put(protect, updateProfile);

router.put('/password', protect, changePassword);

module.exports = router;
