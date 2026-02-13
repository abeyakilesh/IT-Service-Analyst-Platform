// const fetch = require('node-fetch'); // Native fetch in Node 18+

// Helper to make requests
const API_URL = 'http://localhost:5001/api';
let TOKEN = '';

async function login() {
    console.log('Logging in...');
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user1@acme.com', password: 'user1234' })
    });
    const data = await res.json();
    if (!data.success) {
        console.error('Login failed response:', data);
        throw new Error('Login failed');
    }
    TOKEN = data.token;
    console.log('Logged in successfully.');
}

async function createTicket() {
    console.log('Creating ticket...');
    const res = await fetch(`${API_URL}/tickets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`
        },
        body: JSON.stringify({
            title: 'Chat Test Ticket ' + Date.now(),
            description: 'Testing chat features',
            priority: 'medium',
            categoryId: '65c2672d822595300965d131', // Need a valid category ID, will try to get one first
            organizationId: '65c2672d822595300965d131' // Usually inferred from user, but might need category
        })
    });
    // Create often fails if categoryId is invalid. Let's fetch categories first.
    // Actually, let's just use existing ticket if creation fails or fetch first.
    return await res.json();
}

async function getCategories() {
    const res = await fetch(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    return await res.json();
}

async function main() {
    try {
        await login();

        // precise category fetching
        const cats = await getCategories();
        const categoryId = cats.data?.[0]?._id;

        if (!categoryId) {
            console.log('No categories found. Cannot create ticket.');
            return;
        }

        console.log(`Using category: ${categoryId}`);

        // Create ticket
        const ticketRes = await fetch(`${API_URL}/tickets`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${TOKEN}`
            },
            body: JSON.stringify({
                title: 'Chat Backend Test ' + Date.now(),
                description: 'Verifying backend optimizations',
                priority: 'medium',
                categoryId: categoryId
            })
        });

        const ticketData = await ticketRes.json();
        if (!ticketData.success) {
            console.error('Ticket creation failed:', ticketData);
            return;
        }
        const ticketId = ticketData.data._id;
        console.log(`Ticket created: ${ticketId}`);

        // Send messages
        console.log('Sending messages...');
        for (let i = 1; i <= 5; i++) {
            await fetch(`${API_URL}/tickets/${ticketId}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${TOKEN}`
                },
                body: JSON.stringify({ content: `Message ${i}` })
            });
        }

        // Verify Pagination (limit 2)
        console.log('Verifying pagination (limit=2)...');
        const msgsRes = await fetch(`${API_URL}/tickets/${ticketId}/messages?limit=2&page=1`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const msgsData = await msgsRes.json();
        console.log(`Received ${msgsData.data.length} messages (expected 2)`);
        console.log('Pagination meta:', msgsData.pagination);

        if (msgsData.data.length !== 2) throw new Error('Pagination failed');

        // Verify Chat List Order
        console.log('Verifying my-chats order...');
        const chatsRes = await fetch(`${API_URL}/tickets/my-chats`, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        const chatsData = await chatsRes.json();
        const myChat = chatsData.data.find(t => t._id === ticketId);

        if (!myChat) throw new Error('Ticket not found in my-chats');

        console.log('Chat verification details:', {
            lastMessage: myChat.chat?.lastMessage,
            lastMessageAt: myChat.chat?.lastMessageAt,
            title: myChat.title
        });

        if (myChat.chat?.lastMessage !== 'Message 5') {
            console.warn('WARNING: lastMessage mismatch. Expected "Message 5", got:', myChat.chat?.lastMessage);
        } else {
            console.log('SUCCESS: lastMessage matches.');
        }

        if (!myChat.chat?.lastMessageAt) {
            console.warn('WARNING: lastMessageAt is missing');
        } else {
            console.log('SUCCESS: lastMessageAt is present.');
        }

    } catch (err) {
        console.error('Verification failed:', err);
    }
}

main();
