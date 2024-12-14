const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const client = http.createServer(app);
const io = socketIo(client);

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

// Start the client
const PORT = 4000;
client.listen(PORT, () => {
    console.log(`Frontend server is running on http://localhost:${PORT}`);
});
