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

// ADMIN LOGIN
router.post("/admin-login", (req, res) => {
  const { password } = req.body;
  
  if (!password) {
    return res.status(400).json({ message: "Password required" });
  }

  // Admin password is hardcoded as "SAHO9"
  if (password !== "SAHO9") {
    return res.status(400).json({ message: "Invalid password" });
  }

  const token = jwt.sign({ role: "admin", email: "admin@sahaya.local" }, SECRET, { expiresIn: "7d" });
  res.json({ 
    success: true,
    token, 
    user: {
      id: 1,
      name: "Administrator",
      email: "admin@sahaya.local",
      role: "admin"
    }
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
    let table, query;

    if (decoded.role === "admin") {
      table = "admin";
      query = `SELECT id, name, email, phone, admin_id, role FROM ${table} WHERE id = ?`;
    } else {
      table = decoded.role === "provider" ? "providers" : "users";
      query = `SELECT id, name, email, phone, role, rating FROM ${table} WHERE id = ?`;
    }
    
    db.get(query, [decoded.id], (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: "User not found" });
      
      res.json({ success: true, user });
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET PROVIDER DETAILS (Public)
router.get("/provider/:id", (req, res) => {
  db.get(`SELECT id, name, email, phone, service, city, district, state, rating, reviews_count, total_jobs FROM providers WHERE id = ?`, [req.params.id], (err, provider) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!provider) return res.status(404).json({ error: "Provider not found" });
    res.json({ success: true, provider });
  });
});

// UPDATE USER/PROVIDER PROFILE (Protected)
router.put("/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    const { name, phone, houseNo, street, colony, area, city, district, state, pincode } = req.body;
    const table = decoded.role === "provider" ? "providers" : "users";

    db.run(
      `UPDATE ${table} SET name = ?, phone = ?, houseNo = ?, street = ?, colony = ?, area = ?, city = ?, district = ?, state = ?, pincode = ?, updated_at = datetime('now') WHERE id = ?`,
      [name, phone, houseNo, street, colony, area, city, district, state, pincode, decoded.id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Profile updated successfully" });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ADMIN: GET ALL USERS
router.get("/admin/users", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ error: "Access denied" });

    db.all(`SELECT id, name, email, phone, aadhaar, city, district, state, created_at FROM users`, [], (err, users) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, users, count: users.length });
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ADMIN: GET ALL PROVIDERS
router.get("/admin/providers", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ error: "Access denied" });

    db.all(`SELECT id, name, email, phone, service, city, district, state, rating, total_jobs, account_status, created_at FROM providers`, [], (err, providers) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, providers, count: providers.length });
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ADMIN: DELETE ACCOUNT
router.delete("/admin/delete-user/:id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ error: "Access denied" });

    const { type } = req.body; // 'user' or 'provider'
    const table = type === "provider" ? "providers" : "users";

    db.run(`DELETE FROM ${table} WHERE id = ?`, [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, message: `${type} deleted successfully` });
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
