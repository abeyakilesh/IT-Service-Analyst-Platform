const { body } = require('express-validator');

const registerValidator = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('organizationId')
        .notEmpty().withMessage('Organization is required')
        .isMongoId().withMessage('Invalid organization ID'),
    body('role')
        .optional()
        .isIn(['admin', 'analyst', 'user']).withMessage('Role must be admin, analyst, or user'),
];

const loginValidator = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    body('password')
        .notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };
