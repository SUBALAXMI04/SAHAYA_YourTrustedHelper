// database.js
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
  if(err) console.error(err.message);
  else console.log("✅ Database connected");
});

// Example table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  password_hash TEXT
)`);

module.exports = db;
