const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userID = decoded.userID;
    console.log("TOKEN USER ID:", req.userID);

    next();

  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }

};

module.exports = authMiddleware;