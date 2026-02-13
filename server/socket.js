const { Server } = require('socket.io');

let io;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`⚡ Socket connected: ${socket.id}`);

        // Join a room based on userId so we can target specific users
        socket.on('join', (userId) => {
            if (userId) {
                socket.join(`user:${userId}`);
                console.log(`👤 User ${userId} joined room user:${userId}`);
            }
        });

        // Join role-based rooms (admin, analyst, user)
        socket.on('join-role', (role) => {
            if (role) {
                socket.join(`role:${role}`);
                console.log(`🏷️  Socket ${socket.id} joined role:${role}`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`🔌 Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized — call initSocket first');
    }
    return io;
};

module.exports = { initSocket, getIO };
