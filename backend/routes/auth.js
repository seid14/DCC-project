const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const twilio = require('twilio');
const jwt = require('jsonwebtoken');

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Middleware to check MongoDB connection
const ensureMongoConnection = async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ error: 'Database unavailable, please try again later' });
  }
  next();
};

// Signup - Step 1: Send OTP, don’t save until Twilio succeeds
router.post('/signup', ensureMongoConnection, async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber || !/^\+?\d{10,15}$/.test(phoneNumber)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingUser = await User.findOne({ phoneNumber }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ error: 'Phone number already registered' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const tempUser = new User({ phoneNumber, otp: { code: otp, expiresAt: otpExpiry }, isVerified: false });

    try {
      await twilioClient.messages.create({
        body: `Your DCC verification code is: ${otp}. Valid for 10 minutes.`,
        to: phoneNumber,
        from: process.env.TWILIO_PHONE_NUMBER
      });
    } catch (twilioError) {
      await session.abortTransaction();
      session.endSession();
      console.error('Twilio error:', twilioError.message, twilioError.stack);
      return res.status(500).json({ error: 'Failed to send OTP, please try again' });
    }

    await tempUser.save({ session });
    await session.commitTransaction();
    session.endSession();

    res.json({ message: 'OTP sent. Please verify.', tempUserId: tempUser._id });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Signup error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to initiate signup', details: error.message });
  }
});

// Signup - Step 2: Verify OTP and finalize user
router.post('/verify-signup', ensureMongoConnection, async (req, res) => {
  const { tempUserId, otp } = req.body;
  if (!tempUserId || !otp) return res.status(400).json({ error: 'User ID and OTP are required' });

  try {
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
    console.error('Verify signup error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to verify signup', details: error.message });
  }
});

// Login
router.post('/login', ensureMongoConnection, async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber || !/^\+?\d{10,15}$/.test(phoneNumber)) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }

  try {
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ error: 'User not found. Please sign up first.' });

    if (user.isVerified) {
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
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to log in', details: error.message });
  }
});

// Verify login OTP
router.post('/verify-login', ensureMongoConnection, async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ error: 'User ID and OTP are required' });

  try {
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
    console.error('Verify login error:', error.message, error.stack);
    res.status(500).json({ error: 'Failed to verify login OTP', details: error.message });
  }
});

// Verify status
router.get('/verify-status', ensureMongoConnection, async (req, res) => {
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
    console.error('Verify status error:', err.message, err.stack);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Global error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message, err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = router;