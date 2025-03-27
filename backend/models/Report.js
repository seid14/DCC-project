const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Title is required'], minlength: 5 },
  description: { type: String, required: [true, 'Description is required'], minlength: 20 },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['corruption', 'services', 'infrastructure', 'administrative']
  },
  verified: { type: Boolean, default: false },
  verificationCount: { type: Number, default: 0 },
  verifiedBy: [{ type: String, required: true }],
  verificationTimestamps: [{ phoneNumber: String, timestamp: Date }],
  verifiedAt: { type: Date },
  status: { type: String, enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'], default: 'Pending' },
  comments: [{ text: String, by: String, createdAt: { type: Date, default: Date.now } }],
  createdBy: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', reportSchema);