const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
    },
    action: {
        type: String,
        enum: ['CREATE', 'UPDATE', 'DELETE'],
        required: [true, 'Action is required'],
    },
    entity: {
        type: String,
        required: [true, 'Entity type is required'],
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'Entity ID is required'],
    },
    changes: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
