const express = require('express');
const { authenticateToken } = require('../middleware/auth.middleware');
const analyticsController = require('../controllers/analytics.controller');

const router = express.Router();

router.get('/analytics', authenticateToken, analyticsController.getAnalytics);
router.get('/analytics/feature-trend', authenticateToken, analyticsController.getFeatureTimeTrend);

module.exports = router;