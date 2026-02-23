const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const FEATURES = [
  'date_filter',
  'age_filter',
  'gender_filter',
  'bar_chart_zoom',
  'line_chart_hover',
  'filter_apply',
  'chart_export'
];

const GENDERS = ['Male', 'Female', 'Other'];

async function seed() {
  try {
    console.log('Starting seeding...');

    // Clear existing data
    await prisma.featureClick.deleteMany();
    await prisma.user.deleteMany();

    console.log('Cleared existing data');

    // Create 10 users
    const users = [];
    for (let i = 1; i <= 10; i++) {
      const user = await prisma.user.create({
        data: {
          username: `user${i}`,
          password: await bcrypt.hash('password123', 10),
          age: Math.floor(Math.random() * 70) + 18, // 18-88
          gender: GENDERS[Math.floor(Math.random() * GENDERS.length)]
        }
      });
      users.push(user);
    }

    console.log(`Created ${users.length} users`);

    // Create feature clicks over the last 30 days
    const featureClicks = [];
    const now = new Date();
    
    for (let day = 30; day >= 0; day--) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);
      
      // Generate 5-20 clicks per day
      const clicksPerDay = Math.floor(Math.random() * 15) + 5;
      
      for (let i = 0; i < clicksPerDay; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomFeature = FEATURES[Math.floor(Math.random() * FEATURES.length)];
        
        // Randomize time within the day
        const clickDate = new Date(date);
        clickDate.setHours(Math.floor(Math.random() * 24));
        clickDate.setMinutes(Math.floor(Math.random() * 60));
        
        featureClicks.push({
          userId: randomUser.id,
          featureName: randomFeature,
          timestamp: clickDate
        });
      }
    }

    // Bulk insert feature clicks
    for (const click of featureClicks) {
      await prisma.featureClick.create({
        data: click
      });
    }

    console.log(`Created ${featureClicks.length} feature clicks`);
    console.log('Seeding completed successfully!');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();