// database.js
const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./database.db", (err) => {
  if(err) console.error(err.message);
  else console.log("✅ Database connected");
});

// Admin table
db.run(`CREATE TABLE IF NOT EXISTS admin (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  admin_id TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

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
  profile_photo TEXT,
  rating REAL DEFAULT 0,
  total_spent REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  profile_photo TEXT,
  rating REAL DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  total_jobs INTEGER DEFAULT 0,
  total_earned REAL DEFAULT 0,
  total_tips REAL DEFAULT 0,
  account_status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
  tip_amount REAL DEFAULT 0,
  payment_method TEXT DEFAULT 'pending',
  notes TEXT,
  cancellation_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(provider_id) REFERENCES providers(id)
)`);

// Reviews table
db.run(`CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  from_user_id INTEGER NOT NULL,
  to_user_id INTEGER NOT NULL,
  rating INTEGER,
  comment TEXT,
  review_type TEXT DEFAULT 'provider',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(booking_id) REFERENCES bookings(id),
  FOREIGN KEY(from_user_id) REFERENCES users(id),
  FOREIGN KEY(to_user_id) REFERENCES users(id)
)`);

// Chats table
db.run(`CREATE TABLE IF NOT EXISTS chats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(provider_id) REFERENCES providers(id)
)`);

// Messages table
db.run(`CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  chat_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  sender_type TEXT NOT NULL,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(chat_id) REFERENCES chats(id),
  FOREIGN KEY(sender_id) REFERENCES users(id)
)`);

// Notifications table
db.run(`CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_type TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  related_id INTEGER,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
)`);

// Saved Professionals table
db.run(`CREATE TABLE IF NOT EXISTS saved_professionals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(provider_id) REFERENCES providers(id),
  UNIQUE(user_id, provider_id)
)`);

// Service Tracking table
db.run(`CREATE TABLE IF NOT EXISTS service_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  provider_lat REAL,
  provider_lon REAL,
  user_lat REAL,
  user_lon REAL,
  distance_km REAL,
  status TEXT DEFAULT 'active',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(booking_id) REFERENCES bookings(id)
)`);

// Payments table
db.run(`CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  booking_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  provider_id INTEGER NOT NULL,
  amount REAL,
  tip_amount REAL DEFAULT 0,
  payment_method TEXT,
  status TEXT DEFAULT 'pending',
  transaction_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(booking_id) REFERENCES bookings(id),
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(provider_id) REFERENCES providers(id)
)`);

module.exports = db;
