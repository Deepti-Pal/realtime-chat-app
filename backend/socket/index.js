const { createMessage } = require('../db/messagesModel');

// socketId -> username, kept in memory since presence is inherently ephemeral
const onlineUsers = new Map();

function broadcastPresence(io) {
  const usernames = [...new Set(onlineUsers.values())].sort();
  io.emit('presence:update', usernames);
}

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // --- Presence ---
    socket.on('user:join', (username) => {
      if (typeof username !== 'string' || !username.trim()) return;
      onlineUsers.set(socket.id, username.trim());
      broadcastPresence(io);
    });

    // --- Sending messages ---
    socket.on('message:send', (payload, ack) => {
      try {
        const username = onlineUsers.get(socket.id) || (payload && payload.username);
        const text = payload && payload.text;

        if (typeof username !== 'string' || !username.trim()) {
          throw new Error('You must join with a username before sending messages.');
        }
        if (typeof text !== 'string' || !text.trim()) {
          throw new Error('Message text cannot be empty.');
        }
        if (text.length > 2000) {
          throw new Error('Message text must be 2000 characters or fewer.');
        }

        const message = createMessage({ username: username.trim(), text: text.trim() });

        // Broadcast to everyone, including the sender, so every client
        // renders from a single source of truth (the DB row just written).
        io.emit('message:new', message);

        if (typeof ack === 'function') ack({ ok: true, message });
      } catch (err) {
        console.error('[socket] message:send error:', err.message);
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
        else socket.emit('message:error', { error: err.message });
      }
    });

    // --- Typing indicator ---
    socket.on('typing:start', () => {
      const username = onlineUsers.get(socket.id);
      if (!username) return;
      socket.broadcast.emit('typing:update', { username, isTyping: true });
    });

    socket.on('typing:stop', () => {
      const username = onlineUsers.get(socket.id);
      if (!username) return;
      socket.broadcast.emit('typing:update', { username, isTyping: false });
    });

    // --- Disconnection ---
    socket.on('disconnect', (reason) => {
      const username = onlineUsers.get(socket.id);
      onlineUsers.delete(socket.id);
      broadcastPresence(io);
      if (username) {
        socket.broadcast.emit('typing:update', { username, isTyping: false });
      }
      console.log(`[socket] disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (err) => {
      console.error('[socket] socket error:', err);
    });
  });
}

module.exports = { registerSocketHandlers };
