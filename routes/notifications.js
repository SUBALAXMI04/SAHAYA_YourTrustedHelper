const db = require("../database");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET = "sahaya_secret_key";

// GET NOTIFICATIONS
router.get("/", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);

    db.all(
      `SELECT id, type, title, message, is_read, created_at
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [decoded.id],
      (err, notifications) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, notifications });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// MARK AS READ
router.post("/:notification_id/read", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);

    db.run(
      `UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`,
      [req.params.notification_id, decoded.id],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Marked as read" });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET UNREAD COUNT
router.get("/unread/count", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);

    db.get(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
      [decoded.id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, unread_count: result.count });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
