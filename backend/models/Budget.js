const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    trim: true
  },
  allocated: {
    type: Number,
    required: true,
    min: 0
  },
  spent: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Completed', 'On Hold']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Budget', budgetSchema); 