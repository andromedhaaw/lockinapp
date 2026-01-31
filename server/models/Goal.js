const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  target: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly'],
    required: true
  },
  unit: {
    type: String,
    enum: ['hours', 'sessions', 'tasks'],
    required: true
  },
  unlocked: {
    type: Boolean,
    default: false // For future pro features if needed
  }
}, {
  timestamps: true
});

GoalSchema.index({ userId: 1, type: 1 });

module.exports = mongoose.model('Goal', GoalSchema);
