// server.js
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const { createClient } = require('redis');
const { initializeCronJobs } = require('./src/lib/cron');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true);
    
    handle(req, res, parsedUrl);
  });

  // Initialize Socket.IO
  const io = new Server(server);

  // Add authentication middleware
  io.use((socket, next) => {
    // In a real application, you would verify the user's session here
    // For now, we'll just accept all connections
    next();
  });

  // Handle connection events
  io.on('connection', (socket) => {
    console.log('User connected');
    
    // When a user connects, they can specify which channels they want to subscribe to
    socket.on('subscribe', (channels) => {
      if (Array.isArray(channels)) {
        channels.forEach(channel => {
          socket.join(channel);
          console.log(`User joined channel: ${channel}`);
        });
      }
    });
    
    socket.on('unsubscribe', (channels) => {
      if (Array.isArray(channels)) {
        channels.forEach(channel => {
          socket.leave(channel);
          console.log(`User left channel: ${channel}`);
        });
      }
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });

  // Set up Redis subscriber
  const redisSubscriber = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  redisSubscriber.on('error', (err) => console.error('Redis Subscriber Error', err));
  
  redisSubscriber.connect().then(() => {
    console.log('Connected to Redis for subscription');
    
    // Subscribe to relevant channels
    redisSubscriber.subscribe('notifications', (message) => {
      try {
        const data = JSON.parse(message);
        // Emit the message to all connected clients
        // In a real application, you would emit to specific rooms based on the data
        io.emit('notification', data);
      } catch (err) {
        console.error('Error parsing Redis message:', err);
      }
    });
    
    redisSubscriber.subscribe('chat', (message) => {
      try {
        const data = JSON.parse(message);
        // Emit the message to the specific chat room
        io.to(`chat:${data.moduleId}`).emit('chat-message', data);
      } catch (err) {
        console.error('Error parsing Redis message:', err);
      }
    });
    
    redisSubscriber.subscribe('conflicts', (message) => {
      try {
        const data = JSON.parse(message);
        // Emit the conflict event to the specific user
        io.to(`user:${data.userId}`).emit('task-conflict', data);
      } catch (err) {
        console.error('Error parsing Redis message:', err);
      }
    });
  });

  // Initialize cron jobs
  initializeCronJobs();

  server.listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});