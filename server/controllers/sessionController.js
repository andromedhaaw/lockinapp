const WorkSession = require('../models/WorkSession');
const User = require('../models/User');
const { calculateStreak, calculateLevel } = require('../utils/gamificationLogic'); // We'll need to create this or import logic

// @desc    Log a new work session
// @route   POST /api/sessions
// @access  Private
exports.logSession = async (req, res) => {
  try {
    const { dateKey, startTime, endTime, duration, focusMode, deepWorkScore, deepWorkStats } = req.body;

    // 1. Save the session
    const session = await WorkSession.create({
      userId: req.user._id,
      dateKey,
      startTime,
      endTime,
      duration,
      focusMode,
      deepWorkScore,
      deepWorkStats
    });

    // 2. GAMIFICATION LOGIC (Async update user stats)
    // We do this after sending response or look up user to update
    const user = await User.findById(req.user._id);
    
    // Update Total Hours
    const durationHours = duration / (1000 * 60 * 60); // duration in ms
    user.stats.totalHours = (user.stats.totalHours || 0) + durationHours;
    
    // Update XP (Simple rule: 100 XP per hour * Deep Work Score multiplier)
    const multiplier = deepWorkScore ? (deepWorkScore / 50) : 1;
    const earnedXP = Math.round(durationHours * 100 * multiplier);
    user.stats.xp = (user.stats.xp || 0) + earnedXP;

    // Update Streak (simplified check for now, ideally reused logic)
    // For now we just check if lastActiveDate was yesterday or today
    // But since we want robust streak, let's assume the frontend sends/calculates OR we trust the lastActive update
    // We'll update lastActiveDate at least.
    const today = new Date();
    const lastActive = new Date(user.stats.lastActiveDate);
    
    // Check if same day
    const isSameDay = today.toDateString() === lastActive.toDateString();
    
    // Check if consecutive day (yesterday)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const isConsecutive = yesterday.toDateString() === lastActive.toDateString();

    if (isSameDay) {
        // Streak stays same
    } else if (isConsecutive) {
        user.stats.currentStreak += 1;
    } else {
        // Streak broken (if gap > 1 day) - Wait, if it's first session of day after gap
        // Actually lastActiveDate is updated on login too. 
        // Let's rely on robust calculation for now or just inclement if consecutive.
        // If gap is huge, reset?
        const diffTime = Math.abs(today - lastActive);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        if (diffDays > 2) { 
            user.stats.currentStreak = 1; 
        } else if (diffDays === 2) { // 1 day gap means yesterday was missed? No, diffDays=1 is same day usually depending on calc
            // Simpler: if not same day and not consecutive, reset.
             user.stats.currentStreak = 1;
        }
    }
    
    if (user.stats.currentStreak > user.stats.longestStreak) {
        user.stats.longestStreak = user.stats.currentStreak;
    }
    
    user.stats.lastActiveDate = Date.now();
    
    await user.save();

    res.status(201).json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all sessions for current user
// @route   GET /api/sessions
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const sessions = await WorkSession.find({ userId: req.user._id }).sort({ startTime: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get aggregated stats (today/week)
// @route   GET /api/sessions/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    // Simple today stats
    // Ideally we use MongoDB aggregation for periods
    // For MVP, letting frontend aggregate is fine if list is small, BUT for scalability we should aggregate here.
    // Let's return just today's total for now as requested by user plan.
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySessions = await WorkSession.find({
        userId: req.user._id,
        startTime: { $gte: today }
    });
    
    const todayTotal = todaySessions.reduce((acc, sess) => acc + sess.duration, 0);
    
    res.json({
        todayTotal,
        todaySessionCount: todaySessions.length
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
