const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const trackController = require('../controllers/track.controller');

const router = express.Router();

router.post('/track', authenticateToken, trackController.trackFeatureClick);

module.exports = router;