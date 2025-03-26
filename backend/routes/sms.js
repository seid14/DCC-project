const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Handle incoming SMS
router.post('/', async (req, res) => {
  try {
    const { Body, From } = req.body;
    
    // Parse the SMS message
    // Expected format: "Issue: [title] - [description]"
    const match = Body.match(/Issue:\s*(.*?)\s*-\s*(.*)/);
    
    if (!match) {
      return res.status(400).json({ 
        message: 'Invalid message format. Please use: Issue: [title] - [description]' 
      });
    }

    const [, title, description] = match;

    // Create a new report
    const report = new Report({
      title: title.trim(),
      category: 'Service', // Default to Service for SMS reports
      description: description.trim()
    });

    await report.save();

    // Send confirmation SMS
    await client.messages.create({
      body: 'Thank you for your report. We will review it shortly.',
      to: From,
      from: process.env.TWILIO_PHONE_NUMBER
    });

    res.status(200).json({ message: 'Report received and confirmation sent' });
  } catch (error) {
    console.error('Error processing SMS:', error);
    res.status(500).json({ message: 'Error processing SMS report' });
  }
});

module.exports = router; 