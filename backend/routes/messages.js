const express = require('express');
const { createMessage, getHistory } = require('../db/messagesModel');

module.exports = function buildMessageRoutes(io) {
  const router = express.Router();

  // GET /api/messages - fetch chat history
  router.get('/', (req, res) => {
    try {
      const limit = Math.min(Number(req.query.limit) || 200, 500);
      const messages = getHistory(limit);
      res.json({ messages });
    } catch (err) {
      console.error('Failed to fetch history:', err);
      res.status(500).json({ error: 'Could not load chat history.' });
    }
  });

  // POST /api/messages - send a message
  // Also used as a fallback path for clients without a working socket
  // connection; the socket handler is the primary path for real-time delivery.
  router.post('/', (req, res) => {
    try {
      const { username, text } = req.body || {};

      if (typeof username !== 'string' || !username.trim()) {
        return res.status(400).json({ error: 'username is required.' });
      }
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'text is required.' });
      }
      if (text.length > 2000) {
        return res.status(400).json({ error: 'text must be 2000 characters or fewer.' });
      }

      const message = createMessage({ username: username.trim(), text: text.trim() });

      // Broadcast to every connected client (including the sender's other tabs)
      io.emit('message:new', message);

      res.status(201).json({ message });
    } catch (err) {
      console.error('Failed to save message:', err);
      res.status(500).json({ error: 'Could not send message.' });
    }
  });

  return router;
};
