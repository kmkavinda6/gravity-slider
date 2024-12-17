// server/server.js
const express = require('express');
const cors = require('cors');
const osc = require('node-osc');
const WebSocket = require('ws');
const http = require('http');

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);
const PORT = 3001;

// Create WebSocket server attached to the HTTP server instead of a separate port
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Create OSC client for Unreal Engine communication
const oscClient = new osc.Client('192.168.8.42', 7000);

// Store current system state
const state = {
    gravity: 100,
    connected: false,
    lastUpdate: Date.now()
};

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');
    
    // Send initial state
    ws.send(JSON.stringify({
        type: 'state',
        data: state
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received:', data);
            
            if (data.type === 'gravity') {
                state.gravity = data.value;
                state.lastUpdate = Date.now();
                
                // Send to Unreal Engine
                oscClient.send('/gravity', data.value);
                
                // Broadcast to all clients
                wss.clients.forEach((client) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'state',
                            data: state
                        }));
                    }
                });
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('WebSocket server is running on the same port');
});