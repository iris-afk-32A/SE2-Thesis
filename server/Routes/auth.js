const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const { registerUser, loginUser, userData, isFirstTime, validateEmail} = require("../controller/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, userData);
router.get("/first-login", authMiddleware, isFirstTime);
router.post("/validate-email", validateEmail);

module.exports = router;