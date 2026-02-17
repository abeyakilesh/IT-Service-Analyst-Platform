const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Organization = require('../models/Organization');
const User = require('../models/User');
const ServiceCategory = require('../models/ServiceCategory');
const SLA = require('../models/SLA');
const Ticket = require('../models/Ticket');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

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
            Message.deleteMany(),
            Notification.deleteMany(),
        ]);

        // --- Organizations ---
        console.log('🏢 Seeding organizations...');
        const orgs = await Organization.insertMany([
            { name: 'Acme Corp', industry: 'Technology', size: 'Large' },
        ]);

        // --- Service Categories ---
        console.log('📂 Seeding categories...');
        const categories = await ServiceCategory.insertMany([
            { name: 'Network', description: 'Network connectivity and infrastructure', slaTimeLimit: 4 },
            { name: 'Hardware', description: 'Physical equipment failures', slaTimeLimit: 8 },
            { name: 'Software', description: 'Application bugs and requests', slaTimeLimit: 24 },
            { name: 'Database', description: 'Database performance and data integrity', slaTimeLimit: 2 },
            { name: 'General', description: 'General IT support', slaTimeLimit: 48 },
        ]);

        // --- SLAs ---
        console.log('⏱️  Seeding SLAs...');
        await SLA.insertMany([
            { categoryId: categories[0]._id, responseTime: 15, resolutionTime: 4 }, // Network
            { categoryId: categories[1]._id, responseTime: 30, resolutionTime: 8 }, // Hardware
            { categoryId: categories[2]._id, responseTime: 60, resolutionTime: 24 }, // Software
            { categoryId: categories[3]._id, responseTime: 10, resolutionTime: 2 },  // Database
            { categoryId: categories[4]._id, responseTime: 120, resolutionTime: 48 }, // General
        ]);

        // --- Users ---
        console.log('👤 Seeding users...');

        // 1 Admin
        console.log('   Creating Admin...');
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@acme.com',
            password: 'admin1234',
            role: 'admin',
            organizationId: orgs[0]._id,
        });

        // Team Analysts
        console.log('   Creating Analysts...');
        const analystsData = [
            { name: 'Hardware Analyst', email: 'analyst_hw@acme.com', team: 'Hardware' },
            { name: 'Network Analyst', email: 'analyst_net@acme.com', team: 'Network' },
            { name: 'Software Analyst', email: 'analyst_sw@acme.com', team: 'Software' },
            { name: 'Database Analyst', email: 'analyst_db@acme.com', team: 'Database' },
            { name: 'General Analyst', email: 'analyst_gen@acme.com', team: 'General' },
        ];

        const analysts = [];
        for (const a of analystsData) {
            const user = await User.create({
                name: a.name,
                email: a.email,
                password: 'analyst1234',
                role: 'analyst',
                team: a.team,
                organizationId: orgs[0]._id,
            });
            analysts.push(user);
        }

        // 20 Users
        console.log('   Creating 20 Users...');
        const userPromises = [];
        for (let i = 1; i <= 20; i++) {
            userPromises.push(User.create({
                name: `User ${i}`,
                email: `user${i}@acme.com`,
                password: 'user1234',
                role: 'user',
                organizationId: orgs[0]._id,
            }));
        }
        const users = await Promise.all(userPromises);

        // --- Tickets ---
        console.log('🎫 Seeding tickets with random categories...');
        const ticketDocs = [];
        const statuses = ['open', 'in-progress', 'resolved'];
        const priorities = ['low', 'medium', 'high'];

        for (let i = 0; i < 50; i++) {
            const userIdx = i % 20;
            const categoryIdx = i % 5; // Rotate through categories
            const category = categories[categoryIdx];
            // Assign to the analyst matching the category team (simple index match since arrays aligned)
            const analyst = analysts[categoryIdx];

            ticketDocs.push({
                title: `${category.name} Issue #${i + 1}`,
                description: `Automatically generated issue for ${category.name} team.`,
                status: statuses[i % 3],
                priority: priorities[i % 3],
                categoryId: category._id,
                organizationId: orgs[0]._id,
                createdBy: users[userIdx]._id,
                assignedTo: analyst._id, // Pre-assign to correct specialist
                createdAt: new Date(),
            });
        }
        await Ticket.insertMany(ticketDocs);

        console.log('\n✅ Database seeded successfully!');
        console.log('------------------------------------------------');
        console.log('🔑 CREDENTIALS:');
        console.log('   Admin:        admin@acme.com      (See ALL)');
        console.log('   Hardware:     analyst_hw@acme.com (See Hardware only)');
        console.log('   Network:      analyst_net@acme.com (See Network only)');
        console.log('   Database:     analyst_db@acme.com (See Database only)');
        console.log('   User:         user1@acme.com      (See Own only)');
        console.log('   Password:     analyst1234 / user1234 / admin1234');
        console.log('------------------------------------------------');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        process.exit(1);
    }
};

seedData();
