const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

alert("server.js");

server.on('connection', ws => {
    setInterval(() => {
        ws.send(JSON.stringify({ serverTime: new Date().toISOString() }));
    }, 1000);
});

console.log('WebSocket server is running on ws://localhost:8080');
