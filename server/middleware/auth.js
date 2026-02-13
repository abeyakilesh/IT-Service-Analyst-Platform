const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes — verify JWT and attach user to request.
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            error: { message: 'Not authorized — no token provided', code: 'NO_TOKEN' },
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: { message: 'User no longer exists', code: 'USER_NOT_FOUND' },
            });
        }

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: { message: 'Not authorized — invalid token', code: 'INVALID_TOKEN' },
        });
    }
};

/**
 * Authorize by role — must be used AFTER protect.
 * @param  {...string} roles - Allowed roles (e.g., 'admin', 'analyst')
 */
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: {
                    message: `Role '${req.user.role}' is not authorized to access this resource`,
                    code: 'FORBIDDEN',
                },
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
