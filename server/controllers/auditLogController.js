const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get audit logs (with filtering & pagination)
// @route   GET /api/audit-logs
// @access  Private (admin)
exports.getAuditLogs = asyncHandler(async (req, res) => {
    const { userId, action, entity } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (userId) filter.userId = userId;
    if (action) filter.action = action;
    if (entity) filter.entity = entity;

    const total = await AuditLog.countDocuments(filter);

    const logs = await AuditLog.find(filter)
        .populate('userId', 'name email')
        .sort('-timestamp')
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        data: logs,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    });
});
