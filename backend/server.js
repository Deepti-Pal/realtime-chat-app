require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');

const buildMessageRoutes = require('./routes/messages');
const { registerSocketHandlers } = require('./socket');

const PORT = process.env.PORT || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: CLIENT_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

// Basic request logging - useful during grading / manual testing
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/messages', buildMessageRoutes(io));

// Central error handler - keeps the API from ever crashing on a bad request
app.use((err, _req, res, _next) => {
  console.error('Unhandled API error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Chat backend listening on http://localhost:${PORT}`);
  console.log(`Accepting Socket.io connections from ${CLIENT_ORIGIN}`);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
