const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  estimatedTime: {
    type: String, // e.g. "30m"
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for filtering active/completed tasks quickly
TaskSchema.index({ userId: 1, completed: 1 });

module.exports = mongoose.model('Task', TaskSchema);
