/**
 * Centralized error handler middleware.
 */
const errorHandler = (err, req, res, next) => {
    console.error('❌ Error:', err.message);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let code = 'SERVER_ERROR';

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid resource ID format';
        code = 'INVALID_ID';
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value for field '${field}'`;
        code = 'DUPLICATE_KEY';
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        const details = Object.values(err.errors).map((e) => ({
            field: e.path,
            message: e.message,
        }));
        return res.status(statusCode).json({
            success: false,
            error: { message: 'Validation failed', code: 'VALIDATION_ERROR', details },
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
        code = 'INVALID_TOKEN';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
        code = 'TOKEN_EXPIRED';
    }

    res.status(statusCode).json({
        success: false,
        error: { message, code },
    });
};

module.exports = errorHandler;
