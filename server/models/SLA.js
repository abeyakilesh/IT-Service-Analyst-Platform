const mongoose = require('mongoose');

const slaSchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceCategory',
            required: [true, 'Category is required'],
            unique: true,
        },
        responseTime: {
            type: Number,
            required: [true, 'Response time (minutes) is required'],
            min: [1, 'Response time must be at least 1 minute'],
        },
        resolutionTime: {
            type: Number,
            required: [true, 'Resolution time (hours) is required'],
            min: [1, 'Resolution time must be at least 1 hour'],
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('SLA', slaSchema);
