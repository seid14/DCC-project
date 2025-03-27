require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Log the URI to verify it's being loaded (remove this in production)
console.log('MONGODB_URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, { dbName: 'test' })
  .then(() => {
    console.log('Connected to MongoDB (test database)');
    seedUsers();
  })
  .catch(err => console.error('MongoDB connection error:', err));

const seedUsers = async () => {
  try {
    const baseNumber = '+25192006441'; // Fixed base number
    const usersToSeed = [];

    // Generate numbers from +251920064412 to +251920064421
    for (let i = 2; i <= 11; i++) {
      const phoneNumber = `${baseNumber}${i}`;
      const userExists = await User.findOne({ phoneNumber });
      
      if (!userExists) {
        usersToSeed.push({
          phoneNumber: phoneNumber,
          isVerified: true,
          role: 'user'
        });
      }
    }

    // Seed new users if any
    if (usersToSeed.length > 0) {
      await User.insertMany(usersToSeed);
      console.log(`${usersToSeed.length} user(s) created with numbers:`, 
        usersToSeed.map(u => u.phoneNumber));
    } else {
      console.log('All users already exist');
    }

    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding users:', err);
    mongoose.connection.close();
  }
};