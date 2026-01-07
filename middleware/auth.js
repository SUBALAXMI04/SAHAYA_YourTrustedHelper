const jwt = require("jsonwebtoken");
const SECRET = "sahaya_secret_key"; // use .env in production

module.exports = function(req,res,next){
  const authHeader = req.headers["authorization"];
  if(!authHeader) return res.status(401).json({error:"No token provided"});
  const token = authHeader.split(" ")[1];
  if(!token) return res.status(401).json({error:"No token"});
  
  try{
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  }catch(err){
    res.status(401).json({error:"Invalid token"});
  }
};
