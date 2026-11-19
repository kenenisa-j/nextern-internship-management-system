// apps/api-server/scripts/seedDemoData.js
require('dotenv').config();
const { seedDemoData } = require('../src/utils/demoDataSeeder');

async function run() {
  try {
    console.log('Seeding demo data into database...');
    const result = await seedDemoData();
    console.log('Result:', result);
    process.exit(0);
  } catch (error) {
    console.error('Demo data seeding failed:', error);
    process.exit(1);
  }
}

run();
