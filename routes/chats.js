const db = require("../database");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET = "sahaya_secret_key";

// INITIATE CHAT (CONNECT BUTTON)
router.post("/connect", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "user") return res.status(403).json({ error: "Only users can initiate chat" });

    const { provider_id } = req.body;
    if (!provider_id) return res.status(400).json({ error: "Provider ID required" });

    // Check if chat already exists
    db.get(
      `SELECT id FROM chats WHERE user_id = ? AND provider_id = ?`,
      [decoded.id, provider_id],
      (err, existingChat) => {
        if (err) return res.status(500).json({ error: err.message });

        if (existingChat) {
          return res.json({ success: true, chat_id: existingChat.id, message: "Chat already exists" });
        }

        // Create new chat
        db.run(
          `INSERT INTO chats (user_id, provider_id, status, created_at)
           VALUES (?, ?, 'pending', datetime('now'))`,
          [decoded.id, provider_id],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // Notify provider
            db.run(
              `INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
               VALUES (?, 'provider', 'connection_request', 'Connection Request', 'A user wants to connect with you', ?)`,
              [provider_id, this.lastID]
            );

            res.json({ success: true, chat_id: this.lastID, message: "Connection request sent" });
          }
        );
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ACCEPT CONNECTION REQUEST (Provider)
router.post("/:chat_id/accept", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "provider") return res.status(403).json({ error: "Only providers can accept connection" });

    db.get(
      `SELECT user_id, provider_id FROM chats WHERE id = ?`,
      [req.params.chat_id],
      (err, chat) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!chat) return res.status(404).json({ error: "Chat not found" });
        if (chat.provider_id !== decoded.id) return res.status(403).json({ error: "Unauthorized" });

        db.run(
          `UPDATE chats SET status = 'active', updated_at = datetime('now') WHERE id = ?`,
          [req.params.chat_id],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // Notify user
            db.run(
              `INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
               VALUES (?, 'user', 'connection_accepted', 'Connection Accepted', 'The provider accepted your request', ?)`,
              [chat.user_id, req.params.chat_id]
            );

            res.json({ success: true, message: "Connection accepted" });
          }
        );
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// REJECT CONNECTION REQUEST (Provider)
router.post("/:chat_id/reject", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "provider") return res.status(403).json({ error: "Only providers can reject connection" });

    db.get(
      `SELECT user_id, provider_id FROM chats WHERE id = ?`,
      [req.params.chat_id],
      (err, chat) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!chat) return res.status(404).json({ error: "Chat not found" });
        if (chat.provider_id !== decoded.id) return res.status(403).json({ error: "Unauthorized" });

        db.run(
          `UPDATE chats SET status = 'rejected', updated_at = datetime('now') WHERE id = ?`,
          [req.params.chat_id],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // Notify user
            db.run(
              `INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
               VALUES (?, 'user', 'connection_rejected', 'Connection Rejected', 'The provider declined your request', ?)`,
              [chat.user_id, req.params.chat_id]
            );

            res.json({ success: true, message: "Connection rejected" });
          }
        );
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// SEND MESSAGE
router.post("/:chat_id/message", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    db.run(
      `INSERT INTO messages (chat_id, sender_id, sender_type, message, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`,
      [req.params.chat_id, decoded.id, decoded.role, message],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message_id: this.lastID, message: "Message sent" });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET CHAT MESSAGES
router.get("/:chat_id/messages", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    jwt.verify(token, SECRET);

    db.all(
      `SELECT id, sender_id, sender_type, message, created_at
       FROM messages
       WHERE chat_id = ?
       ORDER BY created_at ASC`,
      [req.params.chat_id],
      (err, messages) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, messages });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET MY CHATS
router.get("/", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);

    let query, params;
    if (decoded.role === "user") {
      query = `SELECT c.id, c.status, c.created_at, p.id as provider_id, p.name as provider_name, p.rating
               FROM chats c
               JOIN providers p ON c.provider_id = p.id
               WHERE c.user_id = ?
               ORDER BY c.updated_at DESC`;
      params = [decoded.id];
    } else {
      query = `SELECT c.id, c.status, c.created_at, u.id as user_id, u.name as user_name
               FROM chats c
               JOIN users u ON c.user_id = u.id
               WHERE c.provider_id = ?
               ORDER BY c.updated_at DESC`;
      params = [decoded.id];
    }

    db.all(query, params, (err, chats) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, chats });
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
