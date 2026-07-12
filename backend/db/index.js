const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || './data/chat.db';

// Make sure the folder holding the db file exists (e.g. ./data)
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// ---- Schema ----
// One table is enough for this app's scope: a single global chat room.
// Kept deliberately simple; `room` exists so the schema can support
// multiple rooms later without a migration.
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    room TEXT NOT NULL DEFAULT 'general',
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_messages_room_created
    ON messages (room, created_at);
`);

module.exports = db;
