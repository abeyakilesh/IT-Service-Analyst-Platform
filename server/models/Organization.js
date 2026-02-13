const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Organization name is required'],
            trim: true,
        },
        industry: {
            type: String,
            trim: true,
            default: '',
        },
        size: {
            type: String,
            enum: ['Small', 'Medium', 'Large', 'Enterprise', ''],
            default: '',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Organization', organizationSchema);
