const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
    const { name, email, password, role, organizationId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({
            success: false,
            error: { message: 'Email is already registered', code: 'DUPLICATE_EMAIL' },
        });
    }

    const user = await User.create({ name, email, password, role, organizationId });
    const token = user.getSignedJwtToken();

    res.status(201).json({
        success: true,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                organizationId: user.organizationId,
            },
            token,
        },
    });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        return res.status(401).json({
            success: false,
            error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            error: { message: 'Invalid credentials', code: 'INVALID_CREDENTIALS' },
        });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
        success: true,
        data: {
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
            token,
        },
    });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('organizationId', 'name');

    res.status(200).json({
        success: true,
        data: user,
    });
});
