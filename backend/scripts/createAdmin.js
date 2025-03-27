require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminPhoneNumber = process.env.ADMIN_PHONE_NUMBER;
    if (!adminPhoneNumber) {
      console.error('ADMIN_PHONE_NUMBER not set in .env file');
      process.exit(1);
    }

    const admin = await User.findOneAndUpdate(
      { phoneNumber: adminPhoneNumber },
      { role: 'admin' },
      { upsert: true, new: true }
    );

    console.log('Admin user created/updated:', admin);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin(); 