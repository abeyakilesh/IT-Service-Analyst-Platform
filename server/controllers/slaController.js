const SLA = require('../models/SLA');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all SLA rules
// @route   GET /api/sla
// @access  Private
exports.getSLAs = asyncHandler(async (req, res) => {
    const slas = await SLA.find().populate('categoryId', 'name');
    res.status(200).json({ success: true, data: slas });
});

// @desc    Get SLA for a specific category
// @route   GET /api/sla/:categoryId
// @access  Private
exports.getSLAByCategory = asyncHandler(async (req, res) => {
    const sla = await SLA.findOne({ categoryId: req.params.categoryId }).populate('categoryId', 'name');
    if (!sla) {
        return res.status(404).json({
            success: false,
            error: { message: 'SLA not found for this category', code: 'NOT_FOUND' },
        });
    }
    res.status(200).json({ success: true, data: sla });
});

// @desc    Create or update SLA
// @route   POST /api/sla
// @access  Private (admin)
exports.createSLA = asyncHandler(async (req, res) => {
    const { categoryId, responseTime, resolutionTime } = req.body;

    // Upsert — create or update
    const sla = await SLA.findOneAndUpdate(
        { categoryId },
        { responseTime, resolutionTime },
        { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({ success: true, data: sla });
});
