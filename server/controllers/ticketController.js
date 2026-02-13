const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get tickets (with filtering & pagination)
// @route   GET /api/tickets
// @access  Private
exports.getTickets = asyncHandler(async (req, res) => {
    const { status, priority, categoryId, assignedTo, startDate, endDate, sort } = req.query;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    // Role-based filtering
    if (req.user.role === 'user') {
        filter.createdBy = req.user._id;
    } else {
        filter.organizationId = req.user.organizationId;
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (categoryId) filter.categoryId = categoryId;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sortBy = sort || '-createdAt';
    const total = await Ticket.countDocuments(filter);

    const tickets = await Ticket.find(filter)
        .populate('categoryId', 'name')
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort(sortBy)
        .skip(skip)
        .limit(limit);

    res.status(200).json({
        success: true,
        data: tickets,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
        },
    });
});

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
exports.getTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id)
        .populate('categoryId', 'name')
        .populate('organizationId', 'name')
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email');

    if (!ticket) {
        return res.status(404).json({
            success: false,
            error: { message: 'Ticket not found', code: 'NOT_FOUND' },
        });
    }

    // Users can only see their own tickets
    if (req.user.role === 'user' && ticket.createdBy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            error: { message: 'Not authorized to view this ticket', code: 'FORBIDDEN' },
        });
    }

    res.status(200).json({ success: true, data: ticket });
});

// @desc    Create ticket
// @route   POST /api/tickets
// @access  Private
exports.createTicket = asyncHandler(async (req, res) => {
    req.body.createdBy = req.user._id;
    req.body.organizationId = req.user.organizationId;

    const ticket = await Ticket.create(req.body);

    // Audit log
    await AuditLog.create({
        userId: req.user._id,
        action: 'CREATE',
        entity: 'Ticket',
        entityId: ticket._id,
        changes: { title: ticket.title, priority: ticket.priority },
    });

    const populated = await ticket.populate([
        { path: 'categoryId', select: 'name' },
        { path: 'createdBy', select: 'name email' },
    ]);

    res.status(201).json({ success: true, data: populated });
});

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private (owner/analyst/admin)
exports.updateTicket = asyncHandler(async (req, res) => {
    let ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            error: { message: 'Ticket not found', code: 'NOT_FOUND' },
        });
    }

    // Authorization: owner, analyst, or admin
    const isOwner = ticket.createdBy.toString() === req.user._id.toString();
    const isPrivileged = ['admin', 'analyst'].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
        return res.status(403).json({
            success: false,
            error: { message: 'Not authorized to update this ticket', code: 'FORBIDDEN' },
        });
    }

    // Track changes for audit
    const changes = {};
    for (const key of Object.keys(req.body)) {
        if (ticket[key] !== undefined && ticket[key].toString() !== req.body[key].toString()) {
            changes[key] = { from: ticket[key], to: req.body[key] };
        }
    }

    // Auto-set resolvedAt
    if (req.body.status === 'resolved' && ticket.status !== 'resolved') {
        req.body.resolvedAt = new Date();
    }

    ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate([
        { path: 'categoryId', select: 'name' },
        { path: 'createdBy', select: 'name email' },
        { path: 'assignedTo', select: 'name email' },
    ]);

    // Audit log
    if (Object.keys(changes).length > 0) {
        await AuditLog.create({
            userId: req.user._id,
            action: 'UPDATE',
            entity: 'Ticket',
            entityId: ticket._id,
            changes,
        });
    }

    res.status(200).json({ success: true, data: ticket });
});

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private (admin only)
exports.deleteTicket = asyncHandler(async (req, res) => {
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
        return res.status(404).json({
            success: false,
            error: { message: 'Ticket not found', code: 'NOT_FOUND' },
        });
    }

    await Ticket.findByIdAndDelete(req.params.id);

    // Audit log
    await AuditLog.create({
        userId: req.user._id,
        action: 'DELETE',
        entity: 'Ticket',
        entityId: ticket._id,
        changes: { title: ticket.title },
    });

    res.status(200).json({ success: true, message: 'Ticket deleted' });
});
