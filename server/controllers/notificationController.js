const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 50;
    const notifications = await Notification.find({ userId: req.user._id })
        .populate('ticketId', 'title status priority')
        .sort({ createdAt: -1 })
        .limit(limit);

    const unreadCount = await Notification.countDocuments({ userId: req.user._id, read: false });

    res.status(200).json({ success: true, data: notifications, unreadCount });
});

// @desc    Mark a notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { read: true },
        { new: true }
    );
    if (!notification) {
        return res.status(404).json({ success: false, error: { message: 'Notification not found' } });
    }
    res.status(200).json({ success: true, data: notification });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        { userId: req.user._id, read: false },
        { read: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
});
