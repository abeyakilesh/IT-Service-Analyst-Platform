const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Route imports
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const organizationRoutes = require('./routes/organizations');
const categoryRoutes = require('./routes/categories');
const slaRoutes = require('./routes/sla');
const analyticsRoutes = require('./routes/analytics');
const auditLogRoutes = require('./routes/auditLogs');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --------------- Global Middleware ---------------
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --------------- API Routes ---------------
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/tickets/:ticketId/messages', messageRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/sla', slaRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'IT Service Analytics API is running' });
});

// --------------- Error Handler ---------------
app.use(errorHandler);

module.exports = app;
