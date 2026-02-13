const { validationResult } = require('express-validator');

/**
 * Middleware to check express-validator results.
 * Use after validator arrays in route definitions.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const details = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
        }));
        return res.status(400).json({
            success: false,
            error: { message: 'Validation failed', code: 'VALIDATION_ERROR', details },
        });
    }
    next();
};

module.exports = validate;
