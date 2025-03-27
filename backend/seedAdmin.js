// const mongoose = require('mongoose');
// const User = require('./models/User');

// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));

// const seedAdmin = async () => {
//   try {
//     const adminExists = await User.findOne({ phoneNumber: '+251920064411' });
//     if (!adminExists) {
//       const admin = new User({
//         phoneNumber: '+251920064411',
//         isVerified: true,
//         role: 'admin'
//       });
//       await admin.save();
//       console.log('Admin user created');
//     } else {
//       console.log('Admin already exists');
//     }
//     mongoose.connection.close();
//   } catch (err) {
//     console.error('Error seeding admin:', err);
//     mongoose.connection.close();
//   }
// };

// seedAdmin();
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

// Log the URI to verify it's being loaded (remove this in production)
console.log('MONGODB_URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, { dbName: 'test' })
  .then(() => {
    console.log('Connected to MongoDB (test database)');
    seedAdmin();
  })
  .catch(err => console.error('MongoDB connection error:', err));

const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ phoneNumber: '+251986548635' });
    if (!adminExists) {
      const admin = new User({
        phoneNumber: '+251986548635',
        isVerified: true,
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user created');
    } else {
      console.log('Admin already exists');
    }
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding admin:', err);
    mongoose.connection.close();
  }
};