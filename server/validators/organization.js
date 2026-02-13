const { body } = require('express-validator');

const createOrganizationValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Organization name is required'),
    body('industry')
        .optional()
        .trim(),
    body('size')
        .optional()
        .isIn(['Small', 'Medium', 'Large', 'Enterprise']).withMessage('Invalid size'),
];

module.exports = { createOrganizationValidator };
