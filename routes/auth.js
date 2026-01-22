const db = require("../database");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET = "sahaya_secret_key";

// REGISTER USER/PROVIDER
router.post("/register", (req, res) => {
  const { role, name, email, phone, password, aadhaar, houseNo, street, colony, area, city, district, state, pincode, service } = req.body;
  
  if (!name || !email || !phone || !password || !role) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const table = role === "provider" ? "providers" : "users";

  // Check if email already exists
  db.get(`SELECT id FROM ${table} WHERE email = ?`, [email], (err, existingUser) => {
    if (err) return res.status(500).json({ error: err.message });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    // Insert new user/provider
    if (role === "provider") {
      db.run(
        `INSERT INTO ${table} (name, email, phone, password_hash, aadhaar, houseNo, street, colony, area, city, district, state, pincode, service, role, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [name, email, phone, password, aadhaar, houseNo, street, colony, area, city, district, state, pincode, service, role],
        function(err) {
          if (err) return res.status(400).json({ error: err.message });
          res.json({ success: true, id: this.lastID, message: "Provider registered successfully" });
        }
      );
    } else {
      db.run(
        `INSERT INTO ${table} (name, email, phone, password_hash, aadhaar, houseNo, street, colony, area, city, district, state, pincode, role, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [name, email, phone, password, aadhaar, houseNo, street, colony, area, city, district, state, pincode, role],
        function(err) {
          if (err) return res.status(400).json({ error: err.message });
          res.json({ success: true, id: this.lastID, message: "User registered successfully" });
        }
      );
    }
  });
});

// LOGIN
router.post("/login", (req, res) => {
  const { role, email, password } = req.body;
  
  if (!role || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const table = role === "provider" ? "providers" : "users";
  
  db.get(`SELECT * FROM ${table} WHERE email = ?`, [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }
    
    if (user.password_hash !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }
    
    const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, SECRET, { expiresIn: "7d" });
    res.json({ 
      success: true,
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
});

// GET CURRENT USER (Protected)
router.get("/me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    const table = decoded.role === "provider" ? "providers" : "users";
    
    db.get(`SELECT id, name, email, phone, role FROM ${table} WHERE id = ?`, [decoded.id], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: "User not found" });
      
      res.json({ success: true, user });
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
