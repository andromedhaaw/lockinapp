const mongoose = require('mongoose');

const WorkSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateKey: {
    type: String, // e.g. "2024-01-27"
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in Milliseconds usually, but plan said seconds? Let's stick to ms for precision if frontend sends ms, or convert. Frontend sends ms usually. Let's assume ms to be safe with Date math.
    required: true
  },
  focusMode: {
    type: String,
    enum: ['standard', 'pomodoro'],
    default: 'standard'
  },
  deepWorkScore: {
    type: Number,
    min: 0,
    max: 100
  },
  deepWorkStats: {
    distractions: { type: Number, default: 0 },
    longestFocusBlock: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Compound index for fast history lookup by user and date
WorkSessionSchema.index({ userId: 1, dateKey: -1 });

module.exports = mongoose.model('WorkSession', WorkSessionSchema);
