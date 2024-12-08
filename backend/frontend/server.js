const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Socket.io for real-time updates
io.on('connection', (socket) => {
    console.log('A user connected');

    // Example of emitting real-time updates
    setInterval(() => {
        socket.emit('update', { message: 'Data updated!' });
    }, 1000);

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = 4000;
server.listen(PORT, () => {
    console.log(`Frontend server is running on http://localhost:${PORT}`);
});
