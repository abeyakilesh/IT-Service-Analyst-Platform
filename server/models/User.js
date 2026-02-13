const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false,
        },
        role: {
            type: String,
            enum: ['admin', 'analyst', 'user'],
            default: 'user',
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization',
            required: [true, 'Organization is required'],
        },
    },
    { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare entered password with stored hash
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Generate signed JWT
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

module.exports = mongoose.model('User', userSchema);
