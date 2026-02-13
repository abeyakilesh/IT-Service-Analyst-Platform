const mongoose = require('mongoose');

const serviceCategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Category name is required'],
            trim: true,
            unique: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        slaTimeLimit: {
            type: Number,
            required: [true, 'SLA time limit (hours) is required'],
            min: [1, 'SLA time limit must be at least 1 hour'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('ServiceCategory', serviceCategorySchema);
