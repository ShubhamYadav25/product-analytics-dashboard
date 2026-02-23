const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class AnalyticsController {
  async getAnalytics(req, res) {
    try {
      const { startDate, endDate, ageGroup, gender } = req.query;

      // Build age filter
      let ageFilter = {};
      if (ageGroup && ageGroup !== 'all') {
        switch (ageGroup) {
          case '<18':
            ageFilter = { age: { lt: 18 } };
            break;
          case '18-40':
            ageFilter = { age: { gte: 18, lte: 40 } };
            break;
          case '>40':
            ageFilter = { age: { gt: 40 } };
            break;
        }
      }

      // Build gender filter
      let genderFilter = {};
      if (gender && gender !== 'all') {
        genderFilter = { gender };
      }

      // Get feature clicks with filters
      const featureClicks = await prisma.featureClick.findMany({
        where: {
          timestamp: {
            gte: startDate ? new Date(startDate) : new Date('2024-01-01'),
            lte: endDate ? new Date(endDate) : new Date()
          },
          user: {
            ...ageFilter,
            ...genderFilter
          }
        },
        include: {
          user: true
        },
        orderBy: {
          timestamp: 'asc'
        }
      });

      // Aggregate for bar chart (total clicks per feature)
      const barChartData = featureClicks.reduce((acc, click) => {
        const feature = click.featureName;
        if (!acc[feature]) {
          acc[feature] = {
            featureName: feature,
            totalClicks: 0
          };
        }
        acc[feature].totalClicks++;
        return acc;
      }, {});

      // Get unique feature names for the frontend
      const features = [...new Set(featureClicks.map(click => click.featureName))];

      res.json({
        barChartData: Object.values(barChartData),
        rawData: featureClicks,
        features
      });
    } catch (error) {
      console.error('Analytics error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getFeatureTimeTrend(req, res) {
    try {
      const { featureName, startDate, endDate, ageGroup, gender } = req.query;

      if (!featureName) {
        return res.status(400).json({ error: 'featureName is required' });
      }

      // Build age filter
      let ageFilter = {};
      if (ageGroup && ageGroup !== 'all') {
        switch (ageGroup) {
          case '<18':
            ageFilter = { age: { lt: 18 } };
            break;
          case '18-40':
            ageFilter = { age: { gte: 18, lte: 40 } };
            break;
          case '>40':
            ageFilter = { age: { gt: 40 } };
            break;
        }
      }

      // Build gender filter
      let genderFilter = {};
      if (gender && gender !== 'all') {
        genderFilter = { gender };
      }

      // Get time series data for specific feature
      const timeData = await prisma.featureClick.groupBy({
        by: ['timestamp'],
        where: {
          featureName,
          timestamp: {
            gte: startDate ? new Date(startDate) : new Date('2024-01-01'),
            lte: endDate ? new Date(endDate) : new Date()
          },
          user: {
            ...ageFilter,
            ...genderFilter
          }
        },
        _count: {
          _all: true
        },
        orderBy: {
          timestamp: 'asc'
        }
      });

      // Group by day for better visualization
      const groupedByDay = timeData.reduce((acc, item) => {
        const date = item.timestamp.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = {
            date,
            clicks: 0
          };
        }
        acc[date].clicks += item._count._all;
        return acc;
      }, {});

      res.json({
        featureName,
        timeSeriesData: Object.values(groupedByDay)
      });
    } catch (error) {
      console.error('Time trend error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new AnalyticsController();