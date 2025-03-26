const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const { sendAlert } = require('../utils/sms');
const { auth, adminAuth } = require('../middleware/auth');

// Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error('Get reports error:', err);
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
      category
    });

    const savedReport = await report.save();
    const alertMessage = `New report received:\nTitle: ${title}\nCategory: ${category}\nDescription: ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`;
    await sendAlert(alertMessage);

    res.status(201).json(savedReport);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Error creating report' });
  }
});

// Verify a report
router.post('/:id/verify', auth, async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.isVerified) return res.status(403).json({ message: 'Please verify your phone number to contribute' });

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    if (report.verifiedBy.includes(phoneNumber)) {
      return res.status(400).json({ message: 'You have already verified this report' });
    }

    report.verifiedBy.push(phoneNumber);
    report.verificationCount += 1;

    if (report.verificationCount >= 3) {
      report.verified = true;
      report.verifiedAt = new Date();
    }

    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (err) {
    console.error('Verify report error:', err);
    res.status(400).json({ message: 'Error verifying report' });
  }
});

// Update report status (admin only)
router.patch('/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, comment } = req.body;
    const validStatuses = ['Pending', 'In Progress', 'Resolved', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be Pending, In Progress, Resolved, or Rejected' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    report.status = status;
    if (comment) {
      report.comments = report.comments || [];
      report.comments.push({
        text: comment,
        by: req.user.phoneNumber,
        createdAt: new Date()
      });
    }

    const updatedReport = await report.save();
    res.json(updatedReport);
  } catch (err) {
    console.error('Update status error:', err);
    res.status(500).json({ message: 'Error updating report status' });
  }
});

// Delete report (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    await report.remove();
    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    console.error('Delete report error:', err);
    res.status(500).json({ message: 'Error deleting report' });
  }
});

module.exports = router;