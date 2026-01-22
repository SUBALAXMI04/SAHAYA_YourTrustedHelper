// database.js
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
  if(err) console.error(err.message);
  else console.log("✅ Database connected");
});

// Users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT DEFAULT 'user',
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  aadhaar TEXT,
  houseNo TEXT,
  street TEXT,
  colony TEXT,
  area TEXT,
  city TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Providers table
db.run(`CREATE TABLE IF NOT EXISTS providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT DEFAULT 'provider',
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  aadhaar TEXT,
  service TEXT,
  houseNo TEXT,
  street TEXT,
  colony TEXT,
  area TEXT,
  city TEXT,
  district TEXT,
  state TEXT,
  pincode TEXT,
  rating REAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Bookings table
db.run(`CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  service_type TEXT,
  booking_date TEXT,
  booking_time TEXT,
  status TEXT DEFAULT 'pending',
  amount REAL,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(provider_id) REFERENCES providers(id)
)`);

// Reviews table
db.run(`CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  rating INTEGER,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(booking_id) REFERENCES bookings(id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(provider_id) REFERENCES providers(id)
)`);

module.exports = db;
