const User = require('../models/User');
const WorkSession = require('../models/WorkSession');

// @desc    Get global stats for Admin Dashboard
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSessions = await WorkSession.countDocuments();
    
    // Aggregation for total system hours
    const hoursResult = await WorkSession.aggregate([
      { $group: { _id: null, totalDuration: { $sum: "$duration" } } }
    ]);
    const totalHours = hoursResult.length > 0 ? Math.round(hoursResult[0].totalDuration / (1000 * 60 * 60)) : 0;

    res.json({
      totalUsers,
      totalSessions,
      totalHours
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;

    const total = await User.countDocuments();
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    res.json({
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};
