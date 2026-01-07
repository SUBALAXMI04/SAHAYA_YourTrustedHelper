const express = require("express");
const router = express.Router();
const auth = require("./auth");

module.exports = router;

/* =====================================
   ADD REVIEW & RATING
===================================== */
router.post("/add", auth, (req, res) => {
  const { booking_id, rating, review } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Rating must be 1-5" });
  }

  db.get(
    `SELECT * FROM bookings WHERE id = ? AND status = 'COMPLETED'`,
    [booking_id],
    (err, booking) => {
      if (!booking) return res.status(400).json({ error: "Booking not completed" });

      let from_role, to_role, to_id;
      if (req.user.role === "user" && req.user.id === booking.user_id) {
        from_role = "user";
        to_role = "provider";
        to_id = booking.provider_id;
      } else if (req.user.role === "provider" && req.user.id === booking.provider_id) {
        from_role = "provider";
        to_role = "user";
        to_id = booking.user_id;
      } else {
        return res.status(403).json({ error: "Not allowed" });
      }

      db.run(
        `INSERT INTO reviews (booking_id, from_role, rating, review) VALUES (?,?,?,?)`,
        [booking_id, from_role, rating, review || ""],
        function () {
          // Update provider average rating if needed
          if (from_role === "user") {
            db.get(
              `SELECT AVG(rating) as avg_rating
               FROM reviews r
               JOIN bookings b ON b.id = r.booking_id
               WHERE b.provider_id = ? AND r.from_role='user'`,
              [booking.provider_id],
              (err, row) => {
                if (row?.avg_rating) {
                  db.run(
                    `UPDATE providers SET rating = ? WHERE id = ?`,
                    [row.avg_rating.toFixed(2), booking.provider_id]
                  );
                }
              }
            );
          }

          res.json({ success: true });
        }
      );
    }
  );
});

/* =====================================
   GET REVIEWS FOR A PROVIDER
===================================== */
router.get("/provider/:provider_id", auth, (req, res) => {
  const provider_id = req.params.provider_id;

  db.all(
    `SELECT r.rating, r.review, r.from_role, b.user_id
     FROM reviews r
     JOIN bookings b ON b.id = r.booking_id
     WHERE b.provider_id = ?`,
    [provider_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Error fetching reviews" });
      res.json(rows);
    }
  );
});

/* =====================================
   GET REVIEWS FOR A USER
===================================== */
router.get("/user/:user_id", auth, (req, res) => {
  const user_id = req.params.user_id;

  db.all(
    `SELECT r.rating, r.review, r.from_role, b.provider_id
     FROM reviews r
     JOIN bookings b ON b.id = r.booking_id
     WHERE b.user_id = ?`,
    [user_id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Error fetching reviews" });
      res.json(rows);
    }
  );
});

module.exports = router;
