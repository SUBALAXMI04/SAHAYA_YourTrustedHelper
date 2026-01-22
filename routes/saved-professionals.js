const db = require("../database");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET = "sahaya_secret_key";

// SAVE PROFESSIONAL
router.post("/save/:provider_id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "user") return res.status(403).json({ error: "Only users can save professionals" });

    db.run(
      `INSERT OR IGNORE INTO saved_professionals (user_id, provider_id, saved_at)
       VALUES (?, ?, datetime('now'))`,
      [decoded.id, req.params.provider_id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Professional saved" });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// REMOVE SAVED PROFESSIONAL
router.post("/remove/:provider_id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "user") return res.status(403).json({ error: "Only users can manage saved professionals" });

    db.run(
      `DELETE FROM saved_professionals WHERE user_id = ? AND provider_id = ?`,
      [decoded.id, req.params.provider_id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Professional removed" });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET SAVED PROFESSIONALS
router.get("/", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "user") return res.status(403).json({ error: "Only users can view saved professionals" });

    db.all(
      `SELECT p.id, p.name, p.email, p.phone, p.service, p.city, p.district, p.state, p.rating, p.reviews_count, p.total_jobs
       FROM saved_professionals sp
       JOIN providers p ON sp.provider_id = p.id
       WHERE sp.user_id = ?
       ORDER BY sp.saved_at DESC`,
      [decoded.id],
      (err, professionals) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, professionals, count: professionals.length });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// CHECK IF PROFESSIONAL IS SAVED
router.get("/check/:provider_id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);

    db.get(
      `SELECT id FROM saved_professionals WHERE user_id = ? AND provider_id = ?`,
      [decoded.id, req.params.provider_id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, is_saved: !!result });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
