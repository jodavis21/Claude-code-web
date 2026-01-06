const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'journal.db');
const db = new Database(dbPath);

// Initialize the database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Database operations
const entries = {
  // Get all entries, optionally filtered by search term
  getAll: (search = '') => {
    if (search) {
      return db.prepare(`
        SELECT * FROM entries
        WHERE title LIKE ? OR content LIKE ?
        ORDER BY created_at DESC
      `).all(`%${search}%`, `%${search}%`);
    }
    return db.prepare('SELECT * FROM entries ORDER BY created_at DESC').all();
  },

  // Get a single entry by ID
  getById: (id) => {
    return db.prepare('SELECT * FROM entries WHERE id = ?').get(id);
  },

  // Create a new entry
  create: (title, content) => {
    const stmt = db.prepare('INSERT INTO entries (title, content) VALUES (?, ?)');
    const result = stmt.run(title, content);
    return entries.getById(result.lastInsertRowid);
  },

  // Update an existing entry
  update: (id, title, content) => {
    const stmt = db.prepare(`
      UPDATE entries
      SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(title, content, id);
    return entries.getById(id);
  },

  // Delete an entry
  delete: (id) => {
    const entry = entries.getById(id);
    if (entry) {
      db.prepare('DELETE FROM entries WHERE id = ?').run(id);
    }
    return entry;
  }
};

module.exports = { db, entries };
