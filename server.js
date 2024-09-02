const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// MongoDB setup
mongoose.connect('mongodb://localhost:27017/chatapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB:', err);
});

const messageSchema = new mongoose.Schema({
  username: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// WebSocket connection handling
wss.on('connection', (ws) => {
  ws.on('message', async (data) => {
    try {
      const { username, message } = JSON.parse(data);

      // Save message to MongoDB
      const newMessage = new Message({ username, message });
      await newMessage.save();

      // Broadcast message to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ 
            username:newMessage.username,
            message:newMessage.message, 
            timestamp: newMessage.timestamp }));
        }
      });
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });
});

// Serve static files from the React app
app.use(express.static('client/build'));

// Start server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
