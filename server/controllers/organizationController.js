const Organization = require('../models/Organization');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all organizations
// @route   GET /api/organizations
// @access  Private (admin)
exports.getOrganizations = asyncHandler(async (req, res) => {
    const organizations = await Organization.find().sort('-createdAt');
    res.status(200).json({ success: true, data: organizations });
});

// @desc    Get single organization
// @route   GET /api/organizations/:id
// @access  Private (admin)
exports.getOrganization = asyncHandler(async (req, res) => {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
        return res.status(404).json({
            success: false,
            error: { message: 'Organization not found', code: 'NOT_FOUND' },
        });
    }
    res.status(200).json({ success: true, data: organization });
});

// @desc    Create organization
// @route   POST /api/organizations
// @access  Private (admin)
exports.createOrganization = asyncHandler(async (req, res) => {
    const organization = await Organization.create(req.body);
    res.status(201).json({ success: true, data: organization });
});

// @desc    Update organization
// @route   PUT /api/organizations/:id
// @access  Private (admin)
exports.updateOrganization = asyncHandler(async (req, res) => {
    const organization = await Organization.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!organization) {
        return res.status(404).json({
            success: false,
            error: { message: 'Organization not found', code: 'NOT_FOUND' },
        });
    }
    res.status(200).json({ success: true, data: organization });
});

// @desc    Delete organization
// @route   DELETE /api/organizations/:id
// @access  Private (admin)
exports.deleteOrganization = asyncHandler(async (req, res) => {
    const organization = await Organization.findByIdAndDelete(req.params.id);
    if (!organization) {
        return res.status(404).json({
            success: false,
            error: { message: 'Organization not found', code: 'NOT_FOUND' },
        });
    }
    res.status(200).json({ success: true, message: 'Organization deleted' });
});
