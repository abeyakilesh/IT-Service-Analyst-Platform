const { validationResult } = require('express-validator');

/**
 * Middleware factory — runs express-validator chains then checks results.
 * Compatible with Express 5 (where validation chains can't be passed
 * directly as route-level middleware because they are "thenables").
 *
 * Usage:  router.post('/', validate(createTicketValidator), handler)
 */
const validate = (validations) => async (req, res, next) => {
    // Run every validation chain sequentially
    for (const validation of validations) {
        await validation.run(req);
    }

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

