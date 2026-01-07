const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const db = require("../database");

// Create booking (user)
router.post("/create", authMiddleware, (req,res)=>{
  const { provider_id, service_type, user_location, proposed_price } = req.body;
  db.run(
    `INSERT INTO bookings (user_id, provider_id, service_type, user_location, proposed_price) VALUES (?,?,?,?,?)`,
    [req.user.id, provider_id, service_type, user_location, proposed_price],
    function(err){
      if(err) return res.status(400).json({error:err.message});
      res.json({success:true,id:this.lastID});
    }
  );
});

// Get bookings for logged in user
router.get("/my", authMiddleware, (req,res)=>{
  db.all(`SELECT * FROM bookings WHERE user_id=?`, [req.user.id], (err,rows)=>{
    if(err) return res.status(400).json({error:err.message});
    res.json(rows);
  });
});

module.exports = router;
