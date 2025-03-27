const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const { sendAlert } = require('../utils/sms');
const { auth, adminAuth } = require('../middleware/auth');

const calculateRank = (points) => {
  if (points >= 20) return 'Guardian';
  if (points >= 10) return 'Reliable';
  if (points >= 5) return 'Trusted';
  return 'New';
};

// Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Get reports error:', err.message, err.stack);
    res.status(500).json({ message: 'Error fetching reports' });
  }
});

// Create a new report
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, category } = req.body;
    const validCategories = ['corruption', 'services', 'infrastructure', 'administrative'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    const report = new Report({
      title,
      description,
      category,
      createdBy: req.user.phoneNumber
    });

    const savedReport = await report.save();
    const alertMessage = `New report received:\nTitle: ${title}\nCategory: ${category}\nDescription: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`;
    await sendAlert(alertMessage);

    res.status(201).json(savedReport);
  } catch (error) {
    console.error('Error creating report:', error.message, error.stack);
    res.status(500).json({ message: 'Error creating report' });
  }
});

// Verify a report
router.post('/:id/verify', auth, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required' });

    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your phone number to contribute' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Admins cannot verify reports' });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (report.createdBy === phoneNumber) return res.status(403).json({ message: 'You cannot verify your own report' });
    if (report.verifiedBy.includes(phoneNumber)) {
      return res.status(400).json({ message: 'You have already verified this report' });
    }

    report.verifiedBy.push(phoneNumber);
    report.verificationCount += 1;
    report.verificationTimestamps = report.verificationTimestamps || [];
    report.verificationTimestamps.push({ phoneNumber, timestamp: new Date() });

    if (report.verificationCount >= 3) {
      report.verified = true;
      report.verifiedAt = new Date();
    }

    user.verificationPoints += 1;
    user.rank = calculateRank(user.verificationPoints);
    await user.save();

    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (err) {
    console.error('Verify report error:', err.message, err.stack);
    res.status(500).json({ message: 'Error verifying report' });
  }
});

// Undo verification
router.post('/:id/undo-verify', auth, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ message: 'Phone number is required' });

    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });
    if (!report.verifiedBy.includes(phoneNumber)) {
      return res.status(400).json({ message: 'You have not verified this report' });
    }

    const verification = report.verificationTimestamps.find(v => v.phoneNumber === phoneNumber);
    if (!verification) return res.status(400).json({ message: 'Verification timestamp not found' });

    const timeElapsed = (new Date() - new Date(verification.timestamp)) / (1000 * 60 * 60); // Hours
    if (timeElapsed > 1) {
      return res.status(403).json({ message: 'Undo period (1 hour) has expired' });
    }

    report.verifiedBy = report.verifiedBy.filter(p => p !== phoneNumber);
    report.verificationCount -= 1;
    report.verificationTimestamps = report.verificationTimestamps.filter(v => v.phoneNumber !== phoneNumber);
    report.verified = report.verificationCount >= 3;

    user.verificationPoints -= 1;
    user.rank = calculateRank(user.verificationPoints);
    await user.save();

    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (err) {
    console.error('Undo verify error:', err.message, err.stack);
    res.status(500).json({ message: 'Error undoing verification' });
  }
});

// Update report status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, comment } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: Pending, In Progress, Resolved, Rejected' });
    }
    if (comment && typeof comment !== 'string') {
      return res.status(400).json({ message: 'Comment must be a string' });
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const oldStatus = report.status;
    report.status = status;
    if (comment) {
      report.comments = report.comments || [];
      report.comments.push({
        text: comment,
        by: req.user.phoneNumber || 'Admin',
        createdAt: new Date()
      });
    }

    if (oldStatus !== 'Resolved' && status === 'Resolved') {
      await User.updateMany(
        { phoneNumber: { $in: report.verifiedBy } },
        { $inc: { verificationPoints: 2 } }
      );
    } else if (oldStatus !== 'Rejected' && status === 'Rejected') {
      await User.updateMany(
        { phoneNumber: { $in: report.verifiedBy } },
        { $inc: { verificationPoints: -1 } }
      );
    }

    const users = await User.find({ phoneNumber: { $in: report.verifiedBy } });
    for (const user of users) {
      user.rank = calculateRank(user.verificationPoints);
      await user.save();
    }

    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (err) {
    console.error('Update status error:', err.message, err.stack);
    res.status(500).json({ message: 'Server error updating report status', error: err.message });
  }
});

// Delete report (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid report ID' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    await report.deleteOne();
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Delete report error:', err.message, err.stack);
    res.status(500).json({ message: 'Error deleting report' });
  }
});

module.exports = router;