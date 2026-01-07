const express = require("express");
const router = express.Router();
module.exports = router;

/* =====================================
   PROVIDER → UPDATE LOCATION
===================================== */
router.post("/update", auth, (req, res) => {
  if (req.user.role !== "provider") {
    return res.status(403).json({ error: "Only providers can update location" });
  }

  const { latitude, longitude } = req.body;

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number"
  ) {
    return res.status(400).json({ error: "Invalid coordinates" });
  }

  db.run(
    `INSERT INTO provider_locations
     (provider_id, latitude, longitude)
     VALUES (?,?,?)
     ON CONFLICT(provider_id)
     DO UPDATE SET
       latitude = excluded.latitude,
       longitude = excluded.longitude,
       updated_at = CURRENT_TIMESTAMP`,
    [req.user.id, latitude, longitude],
    () => res.json({ success: true })
  );
});

/* =====================================
   USER → TRACK PROVIDER
===================================== */
router.get("/:booking_id", auth, (req, res) => {
  const booking_id = req.params.booking_id;

  db.get(
    `SELECT b.user_id, b.provider_id, b.status
     FROM bookings b
     WHERE b.id = ?`,
    [booking_id],
    (err, booking) => {
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      if (booking.status !== "ON_THE_WAY") {
        return res.status(400).json({
          error: "Tracking allowed only when provider is on the way"
        });
      }

      const allowed =
        (req.user.role === "user" && req.user.id === booking.user_id) ||
        (req.user.role === "provider" &&
         req.user.id === booking.provider_id);

      if (!allowed) {
        return res.status(403).json({ error: "Not allowed" });
      }

      db.get(
        `SELECT latitude, longitude, updated_at
         FROM provider_locations
         WHERE provider_id = ?`,
        [booking.provider_id],
        (err, location) => {
          if (!location) {
            return res.status(404).json({ error: "Location not available" });
          }
          res.json(location);
        }
      );
    }
  );
});

module.exports = router;
