const Message = require('../models/Message');
const Ticket = require('../models/Ticket');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { getIO } = require('../socket');

// @desc    Get messages for a ticket
// @route   GET /api/tickets/:ticketId/messages
// @access  Private (ticket creator, assignee, admin, analyst)
exports.getMessages = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) {
        return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
    }

    // Access control: only ticket creator, assigned analyst, or admin can view messages
    const userId = req.user._id.toString();
    const isCreator = ticket.createdBy.toString() === userId;
    const isAssignee = ticket.assignedTo?.toString() === userId;
    const isAdminOrAnalyst = ['admin', 'analyst'].includes(req.user.role);

    if (!isCreator && !isAssignee && !isAdminOrAnalyst) {
        return res.status(403).json({ success: false, error: { message: 'Not authorized to view these messages' } });
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ ticketId: req.params.ticketId })
        .populate('senderId', 'name email role')
        .sort({ createdAt: 1 }) // Keep oldest first for chat history
        .skip(skip)
        .limit(limit);

    // If implementing infinite scroll reverse, we might want sort: -1, but for now stick to standard chat order (old -> new)
    // Actually standard chat APIs often return newest first (desc) and client reverses, or limit from the end. 
    // Given the UI appends to bottom, fetching old -> new is fine for first load if we assume we load *last* 50.
    // However, usually we want the *latest* 50. 
    // Let's modify to fetch latest 50 (sort -1, limit 50, then reverse in memory or client).
    // ...Checking current UI... UI expects chronological order. 
    // To get "latest 50", we should find with sort -1, limit 50, then reverse result.
    // BUT to keep it simple and consistent with current UI which expects [old...new], we'll rely on it rendering correctly.
    // If we want "latest" messages, we should probably just return the standard query for now to avoid breaking UI 
    // unless we change frontend to handle "load previous".
    // Let's stick to simple pagination (skip/limit) on created 1 (oldest first) for now, 
    // as changing sort order might break the UI's scroll behavior. 
    // Wait, typical chat load: show LAST 50 messages. 
    // createAt: 1 + skip 0 will show the FIRST 50 messages (the oldest). This is bad for a long chat.
    // We want the LATEST messages. 
    // Correct approach: Sort -1 (newest first), limit 50, then reverse the array to return to client in chronological order.

    const count = await Message.countDocuments({ ticketId: req.params.ticketId });

    // If no specific page requested, return the LAST page (latest messages)
    // simpler: Sort desc, take 50, reverse.
    const rawMessages = await Message.find({ ticketId: req.params.ticketId })
        .populate('senderId', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const sortedMessages = rawMessages.reverse();

    res.status(200).json({
        success: true,
        data: sortedMessages,
        pagination: {
            total: count,
            page,
            limit,
            pages: Math.ceil(count / limit)
        }
    });
});

// @desc    Send a message on a ticket
// @route   POST /api/tickets/:ticketId/messages
// @access  Private (ticket creator, assignee, admin, analyst)
exports.sendMessage = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.ticketId)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email');

    if (!ticket) {
        return res.status(404).json({ success: false, error: { message: 'Ticket not found' } });
    }

    // Access control
    const userId = req.user._id.toString();
    const isCreator = ticket.createdBy._id.toString() === userId;
    const isAssignee = ticket.assignedTo?._id?.toString() === userId;
    const isAdminOrAnalyst = ['admin', 'analyst'].includes(req.user.role);

    if (!isCreator && !isAssignee && !isAdminOrAnalyst) {
        return res.status(403).json({ success: false, error: { message: 'Not authorized to send messages on this ticket' } });
    }

    const message = await Message.create({
        ticketId: req.params.ticketId,
        senderId: req.user._id,
        content: req.body.content,
    });

    // Update ticket's lastMessage fields
    ticket.lastMessageAt = message.createdAt;
    ticket.lastMessage = message.content;
    await ticket.save();

    const populated = await message.populate('senderId', 'name email role');

    // Determine who to notify (the other party)
    try {
        const io = getIO();
        let recipientId;

        if (isCreator) {
            // User sent message → notify assigned analyst (or all admins/analysts if unassigned)
            if (ticket.assignedTo) {
                recipientId = ticket.assignedTo._id.toString();
            }
            // Always notify admin/analyst roles
            io.to('role:admin').to('role:analyst').emit('message:new', {
                ticketId: ticket._id,
                ticketTitle: ticket.title,
                message: populated,
                senderName: req.user.name,
            });
        } else {
            // Analyst/admin sent message → notify ticket creator
            recipientId = ticket.createdBy._id.toString();
            io.to(`user:${recipientId}`).emit('message:new', {
                ticketId: ticket._id,
                ticketTitle: ticket.title,
                message: populated,
                senderName: req.user.name,
            });
        }

        // Create persistent notification for recipient
        if (recipientId) {
            const notification = await Notification.create({
                userId: recipientId,
                type: 'message:new',
                title: `New message on "${ticket.title}"`,
                message: `${req.user.name}: ${req.body.content.substring(0, 100)}`,
                ticketId: ticket._id,
            });
            const populatedNotif = await notification.populate('ticketId', 'title status');
            io.to(`user:${recipientId}`).emit('notification:new', populatedNotif);
        }
    } catch (err) {
        console.error('Socket emit error (message:new):', err.message);
    }

    res.status(201).json({ success: true, data: populated });
});
