const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { chat } = require('../controllers/aiController');

const router = express.Router();

router.post('/chat', protect, chat);

module.exports = router;
