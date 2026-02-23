const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class TrackController {
  async trackFeatureClick(req, res) {
    try {
      const { featureName } = req.body;
      const userId = req.user.userId;

      if (!featureName) {
        return res.status(400).json({ error: 'featureName is required' });
      }

      const featureClick = await prisma.featureClick.create({
        data: {
          userId,
          featureName,
          timestamp: new Date()
        }
      });

      res.status(201).json({
        message: 'Feature click tracked successfully',
        data: featureClick
      });
    } catch (error) {
      console.error('Track error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new TrackController();