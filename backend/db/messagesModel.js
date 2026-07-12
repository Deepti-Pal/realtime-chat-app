const { v4: uuidv4 } = require('uuid');
const db = require('./index');

const ROOM = 'general'; // single global room for this version of the app

const insertStmt = db.prepare(`
  INSERT INTO messages (id, room, username, text, created_at)
  VALUES (@id, @room, @username, @text, @created_at)
`);

const historyStmt = db.prepare(`
  SELECT id, username, text, created_at as createdAt
  FROM messages
  WHERE room = ?
  ORDER BY created_at ASC
  LIMIT ?
`);

function createMessage({ username, text }) {
  const message = {
    id: uuidv4(),
    room: ROOM,
    username,
    text,
    created_at: new Date().toISOString(),
  };
  insertStmt.run(message);
  return {
    id: message.id,
    username: message.username,
    text: message.text,
    createdAt: message.created_at,
  };
}

function getHistory(limit = 200) {
  return historyStmt.all(ROOM, limit);
}

module.exports = { createMessage, getHistory, ROOM };
