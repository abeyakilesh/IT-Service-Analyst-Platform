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
        console.log('👤 Seeding users (1 admin + 10 analysts + 30 users)...');

        // 1 Admin
        const admin = await User.create({
            name: 'Admin CEO',
            email: 'admin@acme.com',
            password: 'admin1234',
            role: 'admin',
            organizationId: orgs[0]._id,
        });

        // 10 Analysts
        const analystData = [];
        for (let i = 1; i <= 10; i++) {
            analystData.push({
                name: `Analyst ${i}`,
                email: `analyst${i}@acme.com`,
                password: 'analyst1234',
                role: 'analyst',
                organizationId: orgs[i <= 4 ? 0 : i <= 7 ? 1 : 2]._id, // distribute across orgs
            });
        }
        const analysts = await User.create(analystData);

        // 30 Users
        const userData = [];
        for (let i = 1; i <= 30; i++) {
            const orgIdx = i <= 10 ? 0 : i <= 20 ? 1 : 2;
            userData.push({
                name: `User ${i}`,
                email: `user${i}@acme.com`,
                password: 'user1234',
                role: 'user',
                organizationId: orgs[orgIdx]._id,
            });
        }
        const users = await User.create(userData);

        // --- Tickets (50 tickets, mapped: each user's ticket is assigned to a specific analyst) ---
        console.log('🎫 Seeding tickets...');
        const now = new Date();
        const hoursAgo = (h) => new Date(now.getTime() - h * 60 * 60 * 1000);
        const statuses = ['open', 'in-progress', 'resolved'];
        const priorities = ['low', 'medium', 'high'];

        const ticketTemplates = [
            { title: 'VPN Connection Issue', desc: 'Cannot connect to company VPN from remote location. Timeout error after 30 seconds.', cat: 0, prio: 'high' },
            { title: 'Email Sync Failure', desc: 'Outlook email is not syncing new messages since this morning. Tried restart.', cat: 2, prio: 'medium' },
            { title: 'Printer Not Responding', desc: 'Floor 3 printer HP LaserJet is not responding to any print commands.', cat: 1, prio: 'low' },
            { title: 'Password Reset Request', desc: 'Need to reset my Active Directory password. Account locked after 5 failed attempts.', cat: 3, prio: 'high' },
            { title: 'Server Downtime Alert', desc: 'Production server showing high CPU usage and intermittent downtime.', cat: 0, prio: 'high' },
            { title: 'Software License Expired', desc: 'Adobe Creative Suite license expired for the design team.', cat: 2, prio: 'medium' },
            { title: 'New Laptop Setup', desc: 'Need a new laptop configured for new marketing hire starting Monday.', cat: 1, prio: 'medium' },
            { title: 'Wi-Fi Connectivity Issues', desc: 'Conference room B Wi-Fi keeps dropping during video calls.', cat: 0, prio: 'high' },
            { title: 'Slack App Crash', desc: 'Slack desktop app crashes every 10 minutes on macOS 14.', cat: 2, prio: 'medium' },
            { title: 'Monitor Flickering', desc: 'External monitor flickering intermittently, display port cable checked.', cat: 1, prio: 'low' },
            { title: 'Cannot Access SharePoint', desc: 'Getting 403 when trying to access team SharePoint site.', cat: 3, prio: 'high' },
            { title: 'Antivirus Update Failed', desc: 'Windows Defender update failing with error code 0x80070005.', cat: 2, prio: 'medium' },
            { title: 'Keyboard Not Working', desc: 'Wireless keyboard stopped working, replaced batteries already.', cat: 1, prio: 'low' },
            { title: 'Database Connection Timeout', desc: 'Production database connection pool exhausted, queries timing out.', cat: 0, prio: 'high' },
            { title: 'MFA Setup Assistance', desc: 'Need help setting up multi-factor authentication on my devices.', cat: 3, prio: 'medium' },
        ];

        const ticketDocs = [];
        for (let i = 0; i < 50; i++) {
            const tpl = ticketTemplates[i % ticketTemplates.length];
            const userIdx = i % 30;
            const analystIdx = Math.floor(userIdx / 3); // 3 users per analyst
            const statusIdx = i % 3;
            const hoursBack = Math.floor(Math.random() * 168) + 1; // 1-168 hours ago

            ticketDocs.push({
                title: i < 15 ? tpl.title : `${tpl.title} #${i + 1}`,
                description: tpl.desc,
                status: statuses[statusIdx],
                priority: tpl.prio,
                categoryId: categories[tpl.cat]._id,
                organizationId: users[userIdx].organizationId,
                createdBy: users[userIdx]._id,
                assignedTo: analysts[analystIdx]._id,
                createdAt: hoursAgo(hoursBack),
                resolvedAt: statuses[statusIdx] === 'resolved' ? hoursAgo(hoursBack - 2) : null,
            });
        }
        const tickets = await Ticket.insertMany(ticketDocs);

        // --- Messages (demo conversations on first 20 tickets) ---
        console.log('💬 Seeding messages...');
        const msgTemplatesUser = [
            'Hi, I need help with this issue urgently.',
            'This has been happening since yesterday morning.',
            'I tried restarting but the problem persists.',
            'Can you please look into this when you get a chance?',
            'Is there any update on this ticket?',
            'The issue is affecting my entire team.',
            'Thank you for looking into this!',
        ];
        const msgTemplatesAnalyst = [
            'Hi, I\'m looking into this now. Will update you shortly.',
            'I\'ve identified the issue. Working on a fix.',
            'Can you try clearing your cache and restarting?',
            'I\'ve escalated this to the infrastructure team.',
            'The fix has been deployed. Please verify on your end.',
            'Let me know if you experience this again.',
            'I\'m running diagnostics on your machine remotely.',
        ];

        const messageDocs = [];
        for (let t = 0; t < 20; t++) {
            const ticket = tickets[t];
            const userIdx = t % 30;
            const analystIdx = Math.floor(userIdx / 3);
            const numMsgs = 3 + Math.floor(Math.random() * 5); // 3-7 messages per ticket
            const baseTime = new Date(ticket.createdAt).getTime();

            for (let m = 0; m < numMsgs; m++) {
                const isUserMsg = m % 2 === 0;
                messageDocs.push({
                    ticketId: ticket._id,
                    senderId: isUserMsg ? users[userIdx]._id : analysts[analystIdx]._id,
                    content: isUserMsg
                        ? msgTemplatesUser[m % msgTemplatesUser.length]
                        : msgTemplatesAnalyst[m % msgTemplatesAnalyst.length],
                    createdAt: new Date(baseTime + m * 15 * 60 * 1000), // 15 min apart
                });
            }
        }
        await Message.insertMany(messageDocs);

        // --- Notifications (recent ones for admin + analysts) ---
        console.log('🔔 Seeding notifications...');
        const notifDocs = [];
        // Admin notifications for recent tickets
        for (let i = 0; i < 10; i++) {
            const ticket = tickets[i];
            const userIdx = i % 30;
            notifDocs.push({
                userId: admin._id,
                type: 'ticket:created',
                title: 'New Ticket',
                message: `New ticket "${ticket.title}" created by ${users[userIdx].name}`,
                ticketId: ticket._id,
                read: i > 5,
                createdAt: ticket.createdAt,
            });
        }
        // Analyst notifications for their assigned tickets
        for (let i = 0; i < 20; i++) {
            const ticket = tickets[i];
            const userIdx = i % 30;
            const analystIdx = Math.floor(userIdx / 3);
            notifDocs.push({
                userId: analysts[analystIdx]._id,
                type: 'ticket:created',
                title: 'New Ticket Assigned',
                message: `"${ticket.title}" from ${users[userIdx].name} has been assigned to you`,
                ticketId: ticket._id,
                read: i > 10,
                createdAt: ticket.createdAt,
            });
            // Message notification for analyst
            if (i < 15) {
                notifDocs.push({
                    userId: analysts[analystIdx]._id,
                    type: 'message:new',
                    title: `Message from ${users[userIdx].name}`,
                    message: `${users[userIdx].name}: ${msgTemplatesUser[i % msgTemplatesUser.length].substring(0, 80)}`,
                    ticketId: ticket._id,
                    read: i > 8,
                    createdAt: new Date(new Date(ticket.createdAt).getTime() + 30 * 60 * 1000),
                });
            }
        }
        // User notifications (ticket status updates)
        for (let i = 0; i < 10; i++) {
            const ticket = tickets[i];
            const userIdx = i % 30;
            const analystIdx = Math.floor(userIdx / 3);
            if (ticket.status !== 'open') {
                notifDocs.push({
                    userId: users[userIdx]._id,
                    type: 'ticket:updated',
                    title: ticket.status === 'resolved' ? 'Ticket Resolved' : 'Ticket Updated',
                    message: `Your ticket "${ticket.title}" has been ${ticket.status === 'resolved' ? 'resolved' : 'updated'} by ${analysts[analystIdx].name}`,
                    ticketId: ticket._id,
                    read: false,
                    createdAt: new Date(new Date(ticket.createdAt).getTime() + 60 * 60 * 1000),
                });
            }
        }
        await Notification.insertMany(notifDocs);

        console.log('\n✅ Database seeded successfully!');
        console.log(`   Organizations: ${orgs.length}`);
        console.log(`   Categories: ${categories.length}`);
        console.log(`   Users: 1 admin + ${analysts.length} analysts + ${users.length} users = ${1 + analysts.length + users.length}`);
        console.log(`   Tickets: ${tickets.length}`);
        console.log(`   Messages: ${messageDocs.length}`);
        console.log(`   Notifications: ${notifDocs.length}`);
        console.log('\n📧 Demo accounts:');
        console.log('   Admin:    admin@acme.com / admin1234');
        console.log('   Analyst:  analyst1@acme.com ... analyst10@acme.com / analyst1234');
        console.log('   User:     user1@acme.com ... user30@acme.com / user1234');
        console.log('\n📊 User-Analyst Mapping:');
        console.log('   Users 1-3  → Analyst 1');
        console.log('   Users 4-6  → Analyst 2');
        console.log('   Users 7-9  → Analyst 3');
        console.log('   Users 10-12 → Analyst 4');
        console.log('   ... and so on (3 users per analyst)');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
};

seedData();
