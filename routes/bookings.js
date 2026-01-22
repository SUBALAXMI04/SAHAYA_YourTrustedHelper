const db = require("../database");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET = "sahaya_secret_key";

// CREATE BOOKING
router.post("/create", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "user") return res.status(403).json({ error: "Only users can book" });

    const { provider_id, service_type, booking_date, booking_time, notes, amount } = req.body;

    if (!provider_id || !service_type || !booking_date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    db.run(
      `INSERT INTO bookings (user_id, provider_id, service_type, booking_date, booking_time, notes, amount, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`,
      [decoded.id, provider_id, service_type, booking_date, booking_time, notes, amount],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        // Create notification for provider
        db.run(
          `INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
           VALUES (?, 'provider', 'new_booking', 'New Booking Request', 'A user wants to book your service', ?)`,
          [provider_id, this.lastID]
        );

        res.json({ success: true, booking_id: this.lastID, message: "Booking created successfully" });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET USER BOOKINGS
router.get("/user", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "user") return res.status(403).json({ error: "Only users can view bookings" });

    db.all(
      `SELECT b.id, b.service_type, b.booking_date, b.booking_time, b.status, b.amount, b.tip_amount,
              p.id as provider_id, p.name as provider_name, p.phone as provider_phone, p.rating
       FROM bookings b
       JOIN providers p ON b.provider_id = p.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [decoded.id],
      (err, bookings) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, bookings, count: bookings.length });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET PROVIDER BOOKINGS
router.get("/provider", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "provider") return res.status(403).json({ error: "Only providers can view bookings" });

    db.all(
      `SELECT b.id, b.service_type, b.booking_date, b.booking_time, b.status, b.amount, b.tip_amount,
              u.id as user_id, u.name as user_name, u.phone as user_phone
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.provider_id = ?
       ORDER BY b.created_at DESC`,
      [decoded.id],
      (err, bookings) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, bookings, count: bookings.length });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// CANCEL BOOKING (only before payment)
router.post("/:booking_id/cancel", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    const { cancellation_reason } = req.body;
    const booking_id = req.params.booking_id;

    // Check booking status
    db.get(`SELECT status, user_id, provider_id FROM bookings WHERE id = ?`, [booking_id], (err, booking) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      // Only allow cancellation before payment
      if (booking.status !== "pending" && booking.status !== "accepted") {
        return res.status(400).json({ error: "Cannot cancel booking in current status" });
      }

      // Check if user is authorized
      if (decoded.role === "user" && booking.user_id !== decoded.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      if (decoded.role === "provider" && booking.provider_id !== decoded.id) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      db.run(
        `UPDATE bookings SET status = 'cancelled', cancellation_reason = ?, updated_at = datetime('now') WHERE id = ?`,
        [cancellation_reason, booking_id],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, message: "Booking cancelled successfully" });
        }
      );
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// ACCEPT BOOKING (Provider)
router.post("/:booking_id/accept", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "provider") return res.status(403).json({ error: "Only providers can accept bookings" });

    const booking_id = req.params.booking_id;

    db.get(`SELECT user_id, provider_id FROM bookings WHERE id = ?`, [booking_id], (err, booking) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      if (booking.provider_id !== decoded.id) return res.status(403).json({ error: "Unauthorized" });

      db.run(
        `UPDATE bookings SET status = 'accepted', updated_at = datetime('now') WHERE id = ?`,
        [booking_id],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });

          // Notify user
          db.run(
            `INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
             VALUES (?, 'user', 'booking_accepted', 'Booking Accepted', 'Your booking has been accepted by the provider', ?)`,
            [booking.user_id, booking_id]
          );

          res.json({ success: true, message: "Booking accepted successfully" });
        }
      );
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// COMPLETE BOOKING (Provider)
router.post("/:booking_id/complete", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "provider") return res.status(403).json({ error: "Only providers can complete bookings" });

    const booking_id = req.params.booking_id;

    db.get(`SELECT user_id, provider_id FROM bookings WHERE id = ?`, [booking_id], (err, booking) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      if (booking.provider_id !== decoded.id) return res.status(403).json({ error: "Unauthorized" });

      db.run(
        `UPDATE bookings SET status = 'completed', updated_at = datetime('now') WHERE id = ?`,
        [booking_id],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });

          // Notify user to give review
          db.run(
            `INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
             VALUES (?, 'user', 'service_completed', 'Service Completed', 'Please rate and review your experience', ?)`,
            [booking.user_id, booking_id]
          );

          res.json({ success: true, message: "Booking completed successfully" });
        }
      );
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
