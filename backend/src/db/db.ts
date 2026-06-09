import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DATABASE_URL || path.resolve(__dirname, '../data/carwash.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

// Initialize database tables
const initTables = async () => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS customers (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS requests (
          id TEXT PRIMARY KEY,
          customerId TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT DEFAULT 'PENDING',
          priority TEXT DEFAULT 'MEDIUM',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          approvedBy TEXT,
          approvedAt DATETIME,
          notes TEXT,
          FOREIGN KEY (customerId) REFERENCES customers(id),
          FOREIGN KEY (approvedBy) REFERENCES users(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'STAFF',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS task_assignments (
          id TEXT PRIMARY KEY,
          requestId TEXT NOT NULL,
          assignedTo TEXT NOT NULL,
          status TEXT DEFAULT 'PENDING',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (requestId) REFERENCES requests(id),
          FOREIGN KEY (assignedTo) REFERENCES users(id)
        )
      `, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });
};

export const getDb = () => db;

export const initializeDatabase = async () => {
  await initTables();
};

export default db;
