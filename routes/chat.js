const express = require("express");
const router = express.Router();
module.exports = router;

/* =====================================
   CREATE CHAT (AUTO AFTER ACCEPT)
===================================== */
router.post("/create", auth, (req, res) => {
  const { booking_id } = req.body;

  db.get(
    `SELECT * FROM bookings WHERE id = ?`,
    [booking_id],
    (err, booking) => {
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.status !== "ACCEPTED") {
        return res.status(400).json({
          error: "Chat allowed only after booking accepted"
        });
      }

      db.run(
        `INSERT OR IGNORE INTO chats (booking_id) VALUES (?)`,
        [booking_id],
        function () {
          res.json({ success: true });
        }
      );
    }
  );
});

/* =====================================
   SEND MESSAGE
===================================== */
router.post("/send", auth, (req, res) => {
  const { booking_id, message } = req.body;

  if (!message || message.trim() === "") {
    return res.status(400).json({ error: "Message empty" });
  }

  db.get(
    `SELECT c.id AS chat_id, b.user_id, b.provider_id
     FROM chats c
     JOIN bookings b ON b.id = c.booking_id
     WHERE c.booking_id = ? AND c.is_active = 1`,
    [booking_id],
    (err, chat) => {
      if (!chat) {
        return res.status(404).json({ error: "Chat not active" });
      }

      const allowed =
        (req.user.role === "user" && req.user.id === chat.user_id) ||
        (req.user.role === "provider" && req.user.id === chat.provider_id);

      if (!allowed) {
        return res.status(403).json({ error: "Not allowed" });
      }

      db.run(
        `INSERT INTO messages
         (chat_id, sender_role, sender_id, message)
         VALUES (?,?,?,?)`,
        [chat.chat_id, req.user.role, req.user.id, message],
        () => res.json({ success: true })
      );
    }
  );
});

/* =====================================
   GET CHAT HISTORY
===================================== */
router.get("/:booking_id", auth, (req, res) => {
  const booking_id = req.params.booking_id;

  db.get(
    `SELECT c.id AS chat_id, b.user_id, b.provider_id
     FROM chats c
     JOIN bookings b ON b.id = c.booking_id
     WHERE c.booking_id = ?`,
    [booking_id],
    (err, chat) => {
      if (!chat) {
        return res.status(404).json({ error: "Chat not found" });
      }

      const allowed =
        (req.user.role === "user" && req.user.id === chat.user_id) ||
        (req.user.role === "provider" && req.user.id === chat.provider_id);

      if (!allowed) {
        return res.status(403).json({ error: "Not allowed" });
      }

      db.all(
        `SELECT sender_role, message, timestamp
         FROM messages
         WHERE chat_id = ?
         ORDER BY timestamp ASC`,
        [chat.chat_id],
        (err, rows) => res.json(rows)
      );
    }
  );
});

/* =====================================
   CLOSE CHAT (ON COMPLETION)
===================================== */
router.post("/close", auth, (req, res) => {
  const { booking_id } = req.body;

  db.run(
    `UPDATE chats
     SET is_active = 0
     WHERE booking_id = ?`,
    [booking_id],
    function () {
      res.json({ success: true });
    }
  );
});

module.exports = router;
