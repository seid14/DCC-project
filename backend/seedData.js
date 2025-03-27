const mongoose = require('mongoose');
const Report = require('./models/Report');
const Budget = require('./models/Budget');
require('dotenv').config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Report.deleteMany({});
    await Budget.deleteMany({});

    // Seed reports
    const reports = [
      {
        title: 'Road Maintenance',
        description: 'Main street needs repaving',
        category: 'Service',
        status: 'pending',
        date: new Date(),
        verified: false
      },
      {
        title: 'Water Supply Issue',
        description: 'Low water pressure in District 2',
        category: 'Service',
        status: 'in_progress',
        date: new Date(),
        verified: true
      },
      {
        title: 'Garbage Collection',
        description: 'Irregular collection schedule',
        category: 'Service',
        status: 'resolved',
        date: new Date(),
        verified: true
      }
    ];

    await Report.insertMany(reports);
    console.log('Reports seeded successfully');

    // Seed budgets
    const budgets = [
      {
        projectName: 'Road Infrastructure',
        allocated: 500000,
        spent: 300000,
        status: 'Active'
      },
      {
        projectName: 'Water Supply System',
        allocated: 300000,
        spent: 350000,
        status: 'On Hold'
      },
      {
        projectName: 'Waste Management',
        allocated: 200000,
        spent: 150000,
        status: 'Completed'
      }
    ];

    await Budget.insertMany(budgets);
    console.log('Budgets seeded successfully');

    console.log('Database seeding completed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData(); 