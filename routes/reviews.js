const db = require("../database");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET = "sahaya_secret_key";

// SUBMIT REVIEW
router.post("/submit", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    const { booking_id, rating, comment } = req.body;

    if (!booking_id || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Invalid rating (1-5)" });
    }

    // Get booking details
    db.get(
      `SELECT user_id, provider_id FROM bookings WHERE id = ?`,
      [booking_id],
      (err, booking) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!booking) return res.status(404).json({ error: "Booking not found" });

        // Determine reviewer type
        let from_user_id, to_user_id;
        if (decoded.role === "user" && booking.user_id === decoded.id) {
          from_user_id = booking.user_id;
          to_user_id = booking.provider_id;
        } else if (decoded.role === "provider" && booking.provider_id === decoded.id) {
          from_user_id = booking.provider_id;
          to_user_id = booking.user_id;
        } else {
          return res.status(403).json({ error: "Unauthorized" });
        }

        // Insert review
        db.run(
          `INSERT INTO reviews (booking_id, from_user_id, to_user_id, rating, comment, review_type, created_at)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
          [booking_id, from_user_id, to_user_id, rating, comment, decoded.role === "user" ? "provider" : "user"],
          function(err) {
            if (err) return res.status(500).json({ error: err.message });

            // Update provider/user average rating
            db.get(
              `SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE to_user_id = ?`,
              [to_user_id],
              (err, stats) => {
                if (err) return;

                const table = decoded.role === "user" ? "providers" : "users";
                db.run(
                  `UPDATE ${table} SET rating = ?, reviews_count = ? WHERE id = ?`,
                  [stats.avg_rating || 0, stats.count || 0, to_user_id]
                );
              }
            );

            res.json({ success: true, review_id: this.lastID, message: "Review submitted successfully" });
          }
        );
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET REVIEWS FOR USER/PROVIDER
router.get("/for-user/:user_id", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    jwt.verify(token, SECRET);

    db.all(
      `SELECT r.rating, r.comment, r.created_at, u.name as reviewer_name, u.role
       FROM reviews r
       JOIN users u ON r.from_user_id = u.id
       WHERE r.to_user_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.user_id],
      (err, reviews) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, reviews, count: reviews.length });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET MY REVIEWS (from logged-in user)
router.get("/my-reviews", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);

    db.all(
      `SELECT r.rating, r.comment, r.created_at, u.name as recipient_name
       FROM reviews r
       JOIN users u ON r.to_user_id = u.id
       WHERE r.from_user_id = ?
       ORDER BY r.created_at DESC`,
      [decoded.id],
      (err, reviews) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, reviews, count: reviews.length });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET REVIEWS ABOUT ME
router.get("/about-me", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);

    db.all(
      `SELECT r.rating, r.comment, r.created_at, u.name as reviewer_name
       FROM reviews r
       JOIN users u ON r.from_user_id = u.id
       WHERE r.to_user_id = ?
       ORDER BY r.created_at DESC`,
      [decoded.id],
      (err, reviews) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, reviews, count: reviews.length });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = router;
