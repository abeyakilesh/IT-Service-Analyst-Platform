const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, 'Ticket title is required'],
            trim: true,
            minlength: [5, 'Title must be at least 5 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            minlength: [10, 'Description must be at least 10 characters'],
        },
        status: {
            type: String,
            enum: ['open', 'in-progress', 'resolved'],
            default: 'open',
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high'],
            required: [true, 'Priority is required'],
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceCategory',
            required: [true, 'Category is required'],
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: [true, 'Organization is required'],
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Creator is required'],
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        resolvedAt: {
            type: Date,
            default: null,
        },
        lastMessageAt: {
            type: Date,
            default: null,
            index: true,
        },
        lastMessage: {
            type: String,
            default: null,
        },
    },
    { timestamps: true }
);

// Auto-set resolvedAt when status changes to resolved
ticketSchema.pre('save', function () {
    if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
        this.resolvedAt = new Date();
    }
});

module.exports = mongoose.model('Ticket', ticketSchema);
