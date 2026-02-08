const jwt = require("jsonwebtoken");
require("dotenv").config();

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) return res.status(401).json({ msg:"Not Logged In" });

  const token = header.split(" ")[1]; // Bearer TOKEN

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // store user info
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
}

module.exports = authMiddleware;




