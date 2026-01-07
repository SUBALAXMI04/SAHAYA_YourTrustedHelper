const express = require("express");
const router = express.Router();
module.exports = router;

/* =====================================
   GET ALL USERS (alphabetical)
===================================== */
router.get("/users", auth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  db.all(
    `SELECT id, name, email, phone, country_code, location, created_at
     FROM users
     ORDER BY name ASC`,
    [],
    (err, users) => {
      res.json(users);
    }
  );
});

/* =====================================
   GET USER DETAILS (services availed)
===================================== */
router.get("/users/:id", auth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  const user_id = req.params.id;

  db.all(
    `SELECT b.id AS booking_id, b.service_type, b.proposed_price, b.status,
            p.name AS provider_name, p.service_type AS provider_service
     FROM bookings b
     JOIN providers p ON p.id = b.provider_id
     WHERE b.user_id = ?`,
    [user_id],
    (err, rows) => res.json(rows)
  );
});

/* =====================================
   GET ALL PROVIDERS (alphabetical)
===================================== */
router.get("/providers", auth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  db.all(
    `SELECT id, name, email, phone, country_code, service_type, base_price, rating, created_at
     FROM providers
     ORDER BY name ASC`,
    [],
    (err, providers) => {
      res.json(providers);
    }
  );
});

/* =====================================
   GET PROVIDER DETAILS (services provided)
===================================== */
router.get("/providers/:id", auth, (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }

  const provider_id = req.params.id;

  db.all(
    `SELECT b.id AS booking_id, b.service_type, b.proposed_price, b.status,
            u.name AS user_name, u.email AS user_email
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     WHERE b.provider_id = ?`,
    [provider_id],
    (err, rows) => res.json(rows)
  );
});

module.exports = router;
