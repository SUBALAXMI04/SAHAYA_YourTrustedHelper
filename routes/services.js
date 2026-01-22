const db = require("../database");
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET = "sahaya_secret_key";

const ALL_SERVICES = [
  "AC Technician", "Baby Care", "Barber", "Beautician", "Cable Services",
  "Carpenter", "Cobbler", "Computer Repair", "Cook", "Delivery",
  "Driver", "Elder Care", "Electrician", "Fridge Repair", "Gardener",
  "Hair Stylist", "Internet Services", "Laundry", "Maid", "Mason",
  "Mechanic", "Milkman", "Mobile Repair", "Nurse", "Painter",
  "Pest Control", "Photographer", "Plumber", "RO Services", "Security",
  "Tailor", "TV Repair", "Washing Machine Repair"
];

// GET ALL SERVICES
router.get("/all", (req, res) => {
  res.json({ success: true, services: ALL_SERVICES });
});

// SEARCH PROVIDERS BY SERVICE AND LOCATION
router.post("/search", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, SECRET);
    const { service, city, district, state, radius_km } = req.body;

    if (!service || !city || !district || !state) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Get all providers matching service and location
    db.all(
      `SELECT id, name, email, phone, service, city, district, state, houseNo, street, rating, reviews_count, total_jobs 
       FROM providers 
       WHERE service = ? AND city = ? AND district = ? AND state = ? AND account_status = 'active'
       ORDER BY rating DESC`,
      [service, city, district, state],
      (err, providers) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, providers, count: providers.length });
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET PROVIDER PROFILE WITH REVIEWS
router.get("/:provider_id/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    jwt.verify(token, SECRET);
    const provider_id = req.params.provider_id;

    db.get(
      `SELECT id, name, email, phone, service, city, district, state, rating, reviews_count, total_jobs, total_earned 
       FROM providers WHERE id = ?`,
      [provider_id],
      (err, provider) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!provider) return res.status(404).json({ error: "Provider not found" });

        // Get reviews
        db.all(
          `SELECT r.rating, r.comment, r.created_at, u.name as reviewer_name 
           FROM reviews r 
           JOIN users u ON r.from_user_id = u.id 
           WHERE r.to_user_id = ? 
           ORDER BY r.created_at DESC 
           LIMIT 10`,
          [provider_id],
          (err, reviews) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, provider, reviews });
          }
        );
      }
    );
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// GET PROVIDERS BY SERVICE (for home page)
router.get("/by-service/:service", (req, res) => {
  db.all(
    `SELECT id, name, email, phone, service, city, district, state, rating, reviews_count, total_jobs 
     FROM providers 
     WHERE service = ? AND account_status = 'active'
     ORDER BY rating DESC
     LIMIT 5`,
    [req.params.service],
    (err, providers) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, providers });
    }
  );
});

module.exports = router;
