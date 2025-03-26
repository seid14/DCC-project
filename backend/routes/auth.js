// const express = require('express');
// const router = express.Router();
// const User = require('../models/User');
// const twilio = require('twilio');
// const jwt = require('jsonwebtoken');

// // Initialize Twilio client
// const twilioClient = twilio(
//   process.env.TWILIO_ACCOUNT_SID,
//   process.env.TWILIO_AUTH_TOKEN
// );

// // Generate a 6-digit OTP
// const generateOTP = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// // Sign up
// router.post('/signup', async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;

//     if (!phoneNumber) {
//       return res.status(400).json({ error: 'Phone number is required' });
//     }

//     const existingUser = await User.findOne({ phoneNumber });
//     if (existingUser) {
//       return res.status(400).json({ error: 'Phone number already registered' });
//     }

//     const user = new User({ phoneNumber });
//     await user.save();

//     const otp = generateOTP();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

//     user.otp = { code: otp, expiresAt: otpExpiry };
//     await user.save();

//     await twilioClient.messages.create({
//       body: `Your DCC verification code is: ${otp}. Valid for 10 minutes.`,
//       to: phoneNumber,
//       from: process.env.TWILIO_PHONE_NUMBER
//     });

//     res.json({ message: 'Account created! Please verify the OTP.' });
//   } catch (error) {
//     console.error('Error in signup:', error);
//     res.status(500).json({ error: 'Failed to create account' });
//   }
// });

// // Login
// router.post('/login', async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;

//     if (!phoneNumber) {
//       return res.status(400).json({ error: 'Phone number is required' });
//     }

//     const user = await User.findOne({ phoneNumber });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found. Please sign up first.' });
//     }

//     const otp = generateOTP();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

//     user.otp = { code: otp, expiresAt: otpExpiry };
//     await user.save();

//     await twilioClient.messages.create({
//       body: `Your DCC login OTP is: ${otp}. Valid for 10 minutes.`,
//       to: phoneNumber,
//       from: process.env.TWILIO_PHONE_NUMBER
//     });

//     res.json({ message: 'OTP sent for login. Please verify.' });
//   } catch (error) {
//     console.error('Error in login:', error);
//     res.status(500).json({ error: 'Failed to log in' });
//   }
// });

// // Verify login OTP
// router.post('/verify-login', async (req, res) => {
//   try {
//     const { phoneNumber, otp } = req.body;

//     if (!phoneNumber || !otp) {
//       return res.status(400).json({ error: 'Phone number and OTP are required' });
//     }

//     const user = await User.findOne({ phoneNumber });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
//       return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
//     }

//     if (user.otp.code !== otp) {
//       return res.status(400).json({ error: 'Invalid OTP' });
//     }

//     if (user.otp.expiresAt < new Date()) {
//       return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
//     }

//     user.otp = undefined;
//     await user.save();

//     const token = jwt.sign(
//       { userId: user._id, phoneNumber: user.phoneNumber, role: user.role },
//       process.env.JWT_SECRET || 'your-secret-key',
//       { expiresIn: '7d' }
//     );

//     res.json({
//       message: 'Logged in successfully!',
//       token,
//       user: { phoneNumber: user.phoneNumber, isVerified: user.isVerified, role: user.role }
//     });
//   } catch (error) {
//     console.error('Error verifying login OTP:', error);
//     res.status(500).json({ error: 'Failed to verify login OTP' });
//   }
// });

// // Send OTP (for phone verification)
// router.post('/send-otp', async (req, res) => {
//   try {
//     const { phoneNumber } = req.body;

//     if (!phoneNumber) {
//       return res.status(400).json({ error: 'Phone number is required' });
//     }

//     let user = await User.findOne({ phoneNumber });
//     if (!user) {
//       user = new User({ phoneNumber });
//     }

//     const otp = generateOTP();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

//     user.otp = { code: otp, expiresAt: otpExpiry };
//     await user.save();

//     await twilioClient.messages.create({
//       body: `Your DCC verification code is: ${otp}. Valid for 10 minutes.`,
//       to: phoneNumber,
//       from: process.env.TWILIO_PHONE_NUMBER
//     });

//     res.json({ message: 'OTP sent successfully' });
//   } catch (error) {
//     console.error('Error sending OTP:', error);
//     res.status(500).json({ error: 'Failed to send OTP' });
//   }
// });

// // Verify OTP (for phone verification)
// router.post('/verify-otp', async (req, res) => {
//   try {
//     const { phoneNumber, otp } = req.body;

//     if (!phoneNumber || !otp) {
//       return res.status(400).json({ error: 'Phone number and OTP are required' });
//     }

//     const user = await User.findOne({ phoneNumber });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     if (!user.otp || !user.otp.code || !user.otp.expiresAt) {
//       return res.status(400).json({ error: 'No OTP found. Please request a new one.' });
//     }

//     if (user.otp.code !== otp) {
//       return res.status(400).json({ error: 'Invalid OTP' });
//     }

//     if (user.otp.expiresAt < new Date()) {
//       return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
//     }

//     user.isVerified = true;
//     user.otp = undefined;
//     await user.save();

//     const token = jwt.sign(
//       { userId: user._id, phoneNumber: user.phoneNumber, role: user.role },
//       process.env.JWT_SECRET || 'your-secret-key',
//       { expiresIn: '7d' }
//     );

//     res.json({
//       message: 'Phone number verified successfully',
//       token,
//       user: { phoneNumber: user.phoneNumber, isVerified: user.isVerified, role: user.role }
//     });
//   } catch (error) {
//     console.error('Error verifying OTP:', error);
//     res.status(500).json({ error: 'Failed to verify OTP' });
//   }
// });

// // Verify status endpoint (fixed)
// router.get('/verify-status', async (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   if (!token) return res.status(401).json({ message: 'No token provided' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
//     const user = await User.findById(decoded.userId).select('phoneNumber isVerified role');
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     res.json({
//       phoneNumber: user.phoneNumber,
//       isVerified: user.isVerified,
//       role: user.role
//     });
//   } catch (err) {
//     console.error('Verify status error:', err);
//     res.status(401).json({ message: 'Invalid token' });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Signup - Step 1: Send OTP, don’t save user yet
router.post('/signup', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });

    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) return res.status(400).json({ error: 'Phone number already registered' });

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Store OTP temporarily (could use Redis, but for now, save as temp user)
    const tempUser = new User({ phoneNumber, otp: { code: otp, expiresAt: otpExpiry }, isVerified: false });
    await tempUser.save();

    await twilioClient.messages.create({
      body: `Your DCC verification code is: ${otp}. Valid for 10 minutes.`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    res.json({ message: 'OTP sent. Please verify.', tempUserId: tempUser._id });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to initiate signup' });
  }
});

// Signup - Step 2: Verify OTP and finalize user
router.post('/verify-signup', async (req, res) => {
  try {
    const { tempUserId, otp } = req.body;
    if (!tempUserId || !otp) return res.status(400).json({ error: 'User ID and OTP are required' });

    const user = await User.findById(tempUserId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'User already verified' });

    if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, phoneNumber: user.phoneNumber, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Account verified and created!',
      token,
      user: { phoneNumber: user.phoneNumber, isVerified: user.isVerified, role: user.role }
    });
  } catch (error) {
    console.error('Verify signup error:', error);
    res.status(500).json({ error: 'Failed to verify signup' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });

    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ error: 'User not found. Please sign up first.' });

    if (user.isVerified) {
      // Skip OTP for verified users
      const token = jwt.sign(
        { userId: user._id, phoneNumber: user.phoneNumber, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
      return res.json({
        message: 'Logged in successfully!',
        token,
        user: { phoneNumber: user.phoneNumber, isVerified: user.isVerified, role: user.role }
      });
    }

    // Unverified users need OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    user.otp = { code: otp, expiresAt: otpExpiry };
    await user.save();

    await twilioClient.messages.create({
      body: `Your DCC login OTP is: ${otp}. Valid for 10 minutes.`,
      to: phoneNumber,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    res.json({ message: 'OTP sent for login. Please verify.', userId: user._id });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in' });
  }
});

// Verify login OTP (for unverified users)
router.post('/verify-login', async (req, res) => {
  try {
    const { userId, otp } = req.body;
    if (!userId || !otp) return res.status(400).json({ error: 'User ID and OTP are required' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'User already verified' });

    if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    user.otp = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, phoneNumber: user.phoneNumber, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Logged in successfully!',
      token,
      user: { phoneNumber: user.phoneNumber, isVerified: user.isVerified, role: user.role }
    });
  } catch (error) {
    console.error('Verify login error:', error);
    res.status(500).json({ error: 'Failed to verify login OTP' });
  }
});

// Verify status
router.get('/verify-status', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('phoneNumber isVerified role');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      phoneNumber: user.phoneNumber,
      isVerified: user.isVerified,
      role: user.role
    });
  } catch (err) {
    console.error('Verify status error:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;