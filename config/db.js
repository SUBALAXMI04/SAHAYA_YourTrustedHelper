const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", err => {
  if (err) console.error(err.message);
  else console.log("✅ Database connected");
});

/* USERS */
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT CHECK(role IN ('admin','user')) NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    country_code TEXT DEFAULT '+91',
    aadhaar_hash TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

/* PROVIDERS */
db.run(`
  CREATE TABLE IF NOT EXISTS providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    country_code TEXT DEFAULT '+91',
    aadhaar_hash TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    service_type TEXT NOT NULL,
    base_price INTEGER NOT NULL,
    rules_accepted INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
