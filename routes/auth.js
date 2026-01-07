const db = require("../database"); // correct if auth.js is inside routes/
const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

const SECRET = "sahaya_secret_key";

// REGISTER
router.post("/register", (req, res) => {
  const { role, name, email, phone, password } = req.body;
  const table = role === "provider" ? "providers" : "users";

  db.run(
    `INSERT INTO ${table} (name,email,phone,password_hash,role) VALUES (?,?,?,?,?)`,
    [name,email,phone,password,role],
    function(err){
      if(err) return res.status(400).json({error: err.message});
      res.json({success:true, id:this.lastID});
    }
  );
});

// LOGIN
router.post("/login", (req,res)=>{
  const { role,email,password } = req.body;
  const table = role==="provider"?"providers":"users";
  
  db.get(`SELECT * FROM ${table} WHERE email=?`, [email], (err,user)=>{
    if(err) return res.status(500).json({error: err.message});
    if(!user || user.password_hash !== password){
      return res.status(400).json({error:"Invalid credentials"});
    }
    const token = jwt.sign({id:user.id,role}, SECRET);
    res.json({token});
  });
});

module.exports = router;
