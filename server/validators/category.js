const { body } = require('express-validator');

const createCategoryValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Category name is required'),
    body('description')
        .optional()
        .trim(),
    body('slaTimeLimit')
        .notEmpty().withMessage('SLA time limit is required')
        .isInt({ min: 1 }).withMessage('SLA time limit must be at least 1 hour'),
];

module.exports = { createCategoryValidator };
