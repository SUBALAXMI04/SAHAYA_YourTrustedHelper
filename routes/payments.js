const db = require("../database");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET = "sahaya_secret_key";

// PROVIDER: SET PRICE FOR BOOKING
router.post("/:booking_id/set-price", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "provider") return res.status(403).json({ error: "Only providers can set price" });

    const { amount } = req.body;
    const booking_id = req.params.booking_id;

    if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    db.get(`SELECT provider_id FROM bookings WHERE id = ?`, [booking_id], (err, booking) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!booking) return res.status(404).json({ error: "Booking not found" });
      if (booking.provider_id !== decoded.id) return res.status(403).json({ error: "Unauthorized" });

      db.run(
        `UPDATE bookings SET amount = ?, status = 'price_set', updated_at = datetime('now') WHERE id = ?`,
        [amount, booking_id],
        function(err) {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, message: "Price set successfully" });
        }
      );
    });
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// PROCESS PAYMENT
router.post("/:booking_id/pay", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    if (decoded.role !== "user") return res.status(403).json({ error: "Only users can make payments" });

    const { payment_method, tip_amount } = req.body;
    const booking_id = req.params.booking_id;

    if (!payment_method || !["online", "cash_on_delivery"].includes(payment_method)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }

    db.get(
      `SELECT b.user_id, b.provider_id, b.amount, b.status FROM bookings b WHERE b.id = ? AND b.user_id = ?`,
      [booking_id, decoded.id],
      (err, booking) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!booking) return res.status(404).json({ error: "Booking not found" });
        if (booking.status !== "price_set") return res.status(400).json({ error: "Invalid booking status" });

        const total_amount = booking.amount + (tip_amount || 0);
        const status = payment_method === "cash_on_delivery" ? "awaiting_delivery" : "paid";

        // Create payment record
        db.run(
          `INSERT INTO payments (booking_id, user_id, provider_id, amount, tip_amount, payment_method, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
          [booking_id, decoded.id, booking.provider_id, booking.amount, tip_amount || 0, payment_method, status],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // Update booking status
            db.run(
              `UPDATE bookings SET status = ?, tip_amount = ?, payment_method = ?, updated_at = datetime('now') WHERE id = ?`,
              [status, tip_amount || 0, payment_method, booking_id],
              function(err) {
                if (err) return res.status(500).json({ error: err.message });

                // Update provider earnings
                db.run(
                  `UPDATE providers SET total_earned = total_earned + ?, total_tips = total_tips + ? WHERE id = ?`,
                  [booking.amount, tip_amount || 0, booking.provider_id]
                );

                // Notify provider
                db.run(
                  `INSERT INTO notifications (user_id, user_type, type, title, message, related_id)
                   VALUES (?, 'provider', 'payment_received', 'Payment Received', 'Payment has been received for your booking', ?)`,
                  [booking.provider_id, booking_id]
                );

                res.json({
                  success: true,
                  message: `Payment processed successfully via ${payment_method}`,
                  payment_id: this.lastID
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET PAYMENT STATUS
router.get("/:booking_id/status", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    jwt.verify(token, SECRET);
    
    db.get(
      `SELECT payment_method, status, amount, tip_amount, created_at FROM payments WHERE booking_id = ?`,
      [req.params.booking_id],
      (err, payment) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!payment) return res.status(404).json({ error: "Payment not found" });
        res.json({ success: true, payment });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
