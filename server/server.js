const dotenv = require('dotenv');
dotenv.config();

const http = require('http');
const connectDB = require('./config/db');
const app = require('./app');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();

    const server = http.createServer(app);

    // Initialize Socket.io
    initSocket(server);

    server.listen(PORT, () => {
        console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
};

startServer();
