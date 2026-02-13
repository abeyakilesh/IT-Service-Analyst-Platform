const Ticket = require('../models/Ticket');
const AnalyticsReport = require('../models/AnalyticsReport');
const SLA = require('../models/SLA');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get dashboard analytics summary
// @route   GET /api/analytics/summary
// @access  Private (admin/analyst)
exports.getSummary = asyncHandler(async (req, res) => {
    const { organizationId, startDate, endDate } = req.query;

    const filter = {};
    if (organizationId) {
        filter.organizationId = organizationId;
    } else {
        filter.organizationId = req.user.organizationId;
    }

    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Aggregate ticket stats
    const totalTickets = await Ticket.countDocuments(filter);
    const openTickets = await Ticket.countDocuments({ ...filter, status: 'open' });
    const inProgressTickets = await Ticket.countDocuments({ ...filter, status: 'in-progress' });
    const resolvedTickets = await Ticket.countDocuments({ ...filter, status: 'resolved' });

    // Average resolution time (in hours)
    const avgResult = await Ticket.aggregate([
        { $match: { ...filter, status: 'resolved', resolvedAt: { $ne: null } } },
        {
            $project: {
                resolutionTime: { $subtract: ['$resolvedAt', '$createdAt'] },
            },
        },
        {
            $group: {
                _id: null,
                avgResolutionTime: { $avg: '$resolutionTime' },
            },
        },
    ]);

    const avgResolutionTimeHours = avgResult.length > 0
        ? parseFloat((avgResult[0].avgResolutionTime / (1000 * 60 * 60)).toFixed(1))
        : 0;

    // SLA breach count
    const slas = await SLA.find().lean();
    const slaMap = {};
    slas.forEach((s) => { slaMap[s.categoryId.toString()] = s.resolutionTime; });

    const resolvedTicketsData = await Ticket.find({
        ...filter,
        status: 'resolved',
        resolvedAt: { $ne: null },
    }).lean();

    let slaBreaches = 0;
    resolvedTicketsData.forEach((t) => {
        const limit = slaMap[t.categoryId.toString()];
        if (limit) {
            const hoursToResolve = (t.resolvedAt - t.createdAt) / (1000 * 60 * 60);
            if (hoursToResolve > limit) slaBreaches++;
        }
    });

    const slaComplianceRate = resolvedTickets > 0
        ? parseFloat(((1 - slaBreaches / resolvedTickets) * 100).toFixed(1))
        : 100;

    // Tickets by priority
    const byPriority = await Ticket.aggregate([
        { $match: filter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
    ]);
    const ticketsByPriority = {};
    byPriority.forEach((p) => { ticketsByPriority[p._id] = p.count; });

    // Tickets by category
    const byCategory = await Ticket.aggregate([
        { $match: filter },
        { $group: { _id: '$categoryId', count: { $sum: 1 } } },
        {
            $lookup: {
                from: 'servicecategories',
                localField: '_id',
                foreignField: '_id',
                as: 'category',
            },
        },
        { $unwind: '$category' },
        { $project: { name: '$category.name', count: 1 } },
    ]);

    res.status(200).json({
        success: true,
        data: {
            totalTickets,
            openTickets,
            inProgressTickets,
            resolvedTickets,
            avgResolutionTimeHours,
            slaBreaches,
            slaComplianceRate,
            ticketsByPriority,
            ticketsByCategory: byCategory,
        },
    });
});

// @desc    Get generated reports
// @route   GET /api/analytics/reports
// @access  Private (admin)
exports.getReports = asyncHandler(async (req, res) => {
    const reports = await AnalyticsReport.find()
        .populate('organizationId', 'name')
        .sort('-generatedAt');
    res.status(200).json({ success: true, data: reports });
});

// @desc    Generate analytics report
// @route   POST /api/analytics/reports/generate
// @access  Private (admin)
exports.generateReport = asyncHandler(async (req, res) => {
    const { organizationId } = req.body;

    const totalTickets = await Ticket.countDocuments({ organizationId });
    const resolved = await Ticket.find({
        organizationId,
        status: 'resolved',
        resolvedAt: { $ne: null },
    }).lean();

    let avgResolutionTime = 0;
    if (resolved.length > 0) {
        const totalMs = resolved.reduce((sum, t) => sum + (t.resolvedAt - t.createdAt), 0);
        avgResolutionTime = parseFloat((totalMs / resolved.length / (1000 * 60 * 60)).toFixed(1));
    }

    // SLA breaches
    const slas = await SLA.find().lean();
    const slaMap = {};
    slas.forEach((s) => { slaMap[s.categoryId.toString()] = s.resolutionTime; });

    let slaBreaches = 0;
    resolved.forEach((t) => {
        const limit = slaMap[t.categoryId.toString()];
        if (limit) {
            const hours = (t.resolvedAt - t.createdAt) / (1000 * 60 * 60);
            if (hours > limit) slaBreaches++;
        }
    });

    const report = await AnalyticsReport.create({
        organizationId,
        totalTickets,
        avgResolutionTime,
        slaBreaches,
    });

    res.status(201).json({ success: true, data: report });
});
