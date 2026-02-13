const ServiceCategory = require('../models/ServiceCategory');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await ServiceCategory.find().sort('name');
    res.status(200).json({ success: true, data: categories });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private (admin)
exports.createCategory = asyncHandler(async (req, res) => {
    const category = await ServiceCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (admin)
exports.updateCategory = asyncHandler(async (req, res) => {
    const category = await ServiceCategory.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    if (!category) {
        return res.status(404).json({
            success: false,
            error: { message: 'Category not found', code: 'NOT_FOUND' },
        });
    }
    res.status(200).json({ success: true, data: category });
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (admin)
exports.deleteCategory = asyncHandler(async (req, res) => {
    const category = await ServiceCategory.findByIdAndDelete(req.params.id);
    if (!category) {
        return res.status(404).json({
            success: false,
            error: { message: 'Category not found', code: 'NOT_FOUND' },
        });
    }
    res.status(200).json({ success: true, message: 'Category deleted' });
});
