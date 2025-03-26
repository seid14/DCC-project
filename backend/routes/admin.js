// const express = require('express');
// const router = express.Router();
// const Report = require('../models/Report');
// const adminAuth = require('../middleware/adminAuth');

// // Get all reports (admin only)
// router.get('/reports', adminAuth, async (req, res) => {
//   try {
//     const reports = await Report.find().sort({ createdAt: -1 });
//     res.json(reports);
//   } catch (error) {
//     res.status(500).json({ error: 'Error fetching reports' });
//   }
// });

// // Update report status (admin only)
// router.patch('/reports/:id/status', adminAuth, async (req, res) => {
//   try {
//     const { status, comment } = req.body;
//     const report = await Report.findById(req.params.id);

//     if (!report) {
//       return res.status(404).json({ error: 'Report not found' });
//     }

//     report.status = status;
//     if (comment) {
//       report.statusComment = comment;
//     }
//     await report.save();

//     res.json({ message: 'Report status updated successfully', report });
//   } catch (error) {
//     res.status(500).json({ error: 'Error updating report status' });
//   }
// });

// // Delete a report (admin only)
// router.delete('/reports/:id', adminAuth, async (req, res) => {
//   try {
//     const report = await Report.findByIdAndDelete(req.params.id);
    
//     if (!report) {
//       return res.status(404).json({ error: 'Report not found' });
//     }

//     res.json({ message: 'Report deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ error: 'Error deleting report' });
//   }
// });

// // Get report statistics
// router.get('/statistics', adminAuth, async (req, res) => {
//   try {
//     const totalReports = await Report.countDocuments();
//     const verifiedReports = await Report.countDocuments({ verified: true });
//     const resolvedReports = await Report.countDocuments({ status: 'completed' });
    
//     // Calculate average response time (time between creation and verification)
//     const verifiedReportsWithTime = await Report.find({ verifiedAt: { $exists: true } });
//     const totalResponseTime = verifiedReportsWithTime.reduce((acc, report) => {
//       return acc + (report.verifiedAt - report.createdAt);
//     }, 0);
//     const averageResponseTime = verifiedReportsWithTime.length > 0 
//       ? Math.round(totalResponseTime / (verifiedReportsWithTime.length * 1000 * 60 * 60)) // Convert to hours
//       : 0;

//     // Get category distribution
//     const categoryDistribution = await Report.aggregate([
//       { $group: { _id: '$category', count: { $sum: 1 } } },
//       { $project: { category: '$_id', count: 1, _id: 0 } }
//     ]);

//     res.json({
//       totalReports,
//       verifiedReports,
//       resolvedReports,
//       averageResponseTime,
//       categoryDistribution: categoryDistribution.reduce((acc, curr) => {
//         acc[curr.category] = curr.count;
//         return acc;
//       }, {})
//     });
//   } catch (err) {
//     console.error('Error fetching statistics:', err);
//     res.status(500).json({ message: 'Error fetching statistics' });
//   }
// });

// module.exports = router; 
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User'); // Add User model
const adminAuth = require('../middleware/adminAuth');

// Get all reports (admin only)
router.get('/reports', adminAuth, async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reports' });
  }
});

// Update report status (admin only)
router.patch('/reports/:id/status', adminAuth, async (req, res) => {
  try {
    const { status, comment } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    report.status = status;
    if (comment) {
      report.statusComment = comment;
    }
    await report.save();

    res.json({ message: 'Report status updated successfully', report });
  } catch (error) {
    res.status(500).json({ error: 'Error updating report status' });
  }
});

// Delete a report (admin only)
router.delete('/reports/:id', adminAuth, async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting report' });
  }
});

// Get report statistics
router.get('/statistics', adminAuth, async (req, res) => {
  try {
    // Report stats
    const totalReports = await Report.countDocuments();
    const verifiedReports = await Report.countDocuments({ verified: true });
    const resolvedReports = await Report.countDocuments({ status: 'completed' });
    
    // User stats
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const bannedUsers = await User.countDocuments({ isBanned: true }); // Assuming isBanned field

    // Recent activity
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const reportsToday = await Report.countDocuments({ createdAt: { $gte: startOfDay } });
    const reportsThisWeek = await Report.countDocuments({ createdAt: { $gte: startOfWeek } });
    const reportsThisMonth = await Report.countDocuments({ createdAt: { $gte: startOfMonth } });

    // Average response time
    const verifiedReportsWithTime = await Report.find({ verifiedAt: { $exists: true } });
    const totalResponseTime = verifiedReportsWithTime.reduce((acc, report) => {
      return acc + (report.verifiedAt - report.createdAt);
    }, 0);
    const averageResponseTime = verifiedReportsWithTime.length > 0 
      ? Math.round(totalResponseTime / (verifiedReportsWithTime.length * 1000 * 60 * 60)) // Convert to hours
      : 0;

    // Category distribution
    const categoryDistribution = await Report.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      totalUsers,
      adminUsers,
      bannedUsers,
      totalReports,
      verifiedReports,
      resolvedReports,
      averageResponseTime,
      statusDistribution: {
        pending: await Report.countDocuments({ status: 'Pending' }), // Match AdminPanel.jsx statuses
        resolved: resolvedReports
      },
      reportsToday,
      reportsThisWeek,
      reportsThisMonth,
      categoryDistribution: categoryDistribution.reduce((acc, curr) => {
        acc[curr.category] = curr.count;
        return acc;
      }, {})
    });
  } catch (err) {
    console.error('Error fetching statistics:', err);
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;