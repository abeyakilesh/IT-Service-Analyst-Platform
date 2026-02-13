const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Organization = require('../models/Organization');
const User = require('../models/User');
const ServiceCategory = require('../models/ServiceCategory');
const SLA = require('../models/SLA');
const Ticket = require('../models/Ticket');

const seedData = async () => {
    try {
        await connectDB();
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            Organization.deleteMany(),
            User.deleteMany(),
            ServiceCategory.deleteMany(),
            SLA.deleteMany(),
            Ticket.deleteMany(),
        ]);

        // --- Organizations ---
        console.log('🏢 Seeding organizations...');
        const orgs = await Organization.insertMany([
            { name: 'Acme Corp', industry: 'Technology', size: 'Large' },
            { name: 'Globex Inc', industry: 'Finance', size: 'Enterprise' },
            { name: 'Stark Industries', industry: 'Manufacturing', size: 'Enterprise' },
        ]);

        // --- Service Categories ---
        console.log('📂 Seeding categories...');
        const categories = await ServiceCategory.insertMany([
            { name: 'Network', description: 'Network connectivity and infrastructure issues', slaTimeLimit: 4 },
            { name: 'Hardware', description: 'Physical equipment failures and requests', slaTimeLimit: 8 },
            { name: 'Software', description: 'Application bugs and software requests', slaTimeLimit: 24 },
            { name: 'Access/Auth', description: 'Login, permissions, and access control issues', slaTimeLimit: 2 },
            { name: 'Other', description: 'General IT service requests', slaTimeLimit: 48 },
        ]);

        // --- SLAs ---
        console.log('⏱️  Seeding SLAs...');
        await SLA.insertMany([
            { categoryId: categories[0]._id, responseTime: 15, resolutionTime: 4 },
            { categoryId: categories[1]._id, responseTime: 30, resolutionTime: 8 },
            { categoryId: categories[2]._id, responseTime: 60, resolutionTime: 24 },
            { categoryId: categories[3]._id, responseTime: 10, resolutionTime: 2 },
            { categoryId: categories[4]._id, responseTime: 120, resolutionTime: 48 },
        ]);

        // --- Users ---
        console.log('👤 Seeding users...');
        const users = await User.create([
            { name: 'Admin User', email: 'admin@acme.com', password: 'admin1234', role: 'admin', organizationId: orgs[0]._id },
            { name: 'Analyst Jane', email: 'analyst@acme.com', password: 'analyst1234', role: 'analyst', organizationId: orgs[0]._id },
            { name: 'John Doe', email: 'user@acme.com', password: 'user1234', role: 'user', organizationId: orgs[0]._id },
            { name: 'Sarah Smith', email: 'sarah@globex.com', password: 'user1234', role: 'user', organizationId: orgs[1]._id },
        ]);

        // --- Tickets ---
        console.log('🎫 Seeding tickets...');
        const now = new Date();
        const hoursAgo = (h) => new Date(now.getTime() - h * 60 * 60 * 1000);

        await Ticket.insertMany([
            { title: 'VPN Connection Issue', description: 'Cannot connect to company VPN from remote location. Shows timeout error.', status: 'open', priority: 'high', categoryId: categories[0]._id, organizationId: orgs[0]._id, createdBy: users[2]._id, createdAt: hoursAgo(2) },
            { title: 'Email Sync Failure', description: 'Outlook email is not syncing new messages since this morning.', status: 'in-progress', priority: 'medium', categoryId: categories[2]._id, organizationId: orgs[0]._id, createdBy: users[2]._id, assignedTo: users[1]._id, createdAt: hoursAgo(5) },
            { title: 'Printer Not Responding', description: 'Floor 3 printer HP LaserJet is not responding to any print commands.', status: 'resolved', priority: 'low', categoryId: categories[1]._id, organizationId: orgs[0]._id, createdBy: users[2]._id, assignedTo: users[1]._id, createdAt: hoursAgo(48), resolvedAt: hoursAgo(44) },
            { title: 'Password Reset Request', description: 'Need to reset my Active Directory password. Account locked after 5 failed attempts.', status: 'resolved', priority: 'high', categoryId: categories[3]._id, organizationId: orgs[0]._id, createdBy: users[2]._id, assignedTo: users[1]._id, createdAt: hoursAgo(24), resolvedAt: hoursAgo(23) },
            { title: 'Server Downtime Alert', description: 'Production server showing high CPU usage and intermittent downtime.', status: 'open', priority: 'high', categoryId: categories[0]._id, organizationId: orgs[0]._id, createdBy: users[0]._id, createdAt: hoursAgo(1) },
            { title: 'Software License Expired', description: 'Adobe Creative Suite license has expired for the design team.', status: 'open', priority: 'medium', categoryId: categories[2]._id, organizationId: orgs[1]._id, createdBy: users[3]._id, createdAt: hoursAgo(12) },
            { title: 'New Laptop Setup', description: 'Need a new laptop configured for the new marketing hire starting Monday.', status: 'in-progress', priority: 'medium', categoryId: categories[1]._id, organizationId: orgs[1]._id, createdBy: users[3]._id, createdAt: hoursAgo(72) },
            { title: 'Wi-Fi Connectivity Issues', description: 'Conference room B Wi-Fi keeps dropping during video calls.', status: 'resolved', priority: 'high', categoryId: categories[0]._id, organizationId: orgs[0]._id, createdBy: users[2]._id, assignedTo: users[1]._id, createdAt: hoursAgo(96), resolvedAt: hoursAgo(90) },
        ]);

        console.log('✅ Database seeded successfully!');
        console.log(`   Organizations: ${orgs.length}`);
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Users: ${users.length}`);
        console.log(`   Tickets: 8`);
        console.log('\n📧 Test accounts:');
        console.log('   Admin:   admin@acme.com / admin1234');
        console.log('   Analyst: analyst@acme.com / analyst1234');
        console.log('   User:    user@acme.com / user1234');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    }
};

seedData();
