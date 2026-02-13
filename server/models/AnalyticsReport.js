const mongoose = require('mongoose');

const analyticsReportSchema = new mongoose.Schema(
    {
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: [true, 'Organization is required'],
        },
        totalTickets: {
            type: Number,
            required: true,
            default: 0,
        },
        avgResolutionTime: {
            type: Number,
            required: true,
            default: 0,
        },
        slaBreaches: {
            type: Number,
            required: true,
            default: 0,
        },
        generatedAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('AnalyticsReport', analyticsReportSchema);
