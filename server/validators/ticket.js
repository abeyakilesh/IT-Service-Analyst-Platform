const { body } = require('express-validator');

const createTicketValidator = [
    body('title')
        .trim()
        .notEmpty().withMessage('Title is required')
        .isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
    body('description')
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('priority')
        .notEmpty().withMessage('Priority is required')
        .isIn(['low', 'medium', 'high']).withMessage('Priority must be low, medium, or high'),
    body('categoryId')
        .notEmpty().withMessage('Category is required')
        .isMongoId().withMessage('Invalid category ID'),
];

const updateTicketValidator = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
    body('description')
        .optional()
        .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('status')
        .optional()
        .isIn(['open', 'in-progress', 'resolved']).withMessage('Invalid status'),
    body('priority')
        .optional()
        .isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
    body('assignedTo')
        .optional()
        .isMongoId().withMessage('Invalid user ID for assignedTo'),
];

module.exports = { createTicketValidator, updateTicketValidator };
