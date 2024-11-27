const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const robot = require('robotjs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Serve the client files

io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Relay WebRTC signaling messages
    socket.on('offer', (data) => socket.broadcast.emit('offer', data));
    socket.on('answer', (data) => socket.broadcast.emit('answer', data));
    socket.on('candidate', (data) => socket.broadcast.emit('candidate', data));

    // Handle remote control commands
    socket.on('control', (data) => {
        const { type, x, y, button, key } = data;

        switch (type) {
            case 'mousemove':
                robot.moveMouse(x, y);
                break;
            case 'click':
                robot.mouseClick(button || 'left');
                break;
            case 'keydown':
                robot.keyToggle(key, 'down');
                break;
            case 'keyup':
                robot.keyToggle(key, 'up');
                break;
        }
    });

    socket.on('disconnect', () => {
        console.log('Disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
