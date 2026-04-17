const express = require("express");
const router = express.Router();
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const { getMe, patchMe, uploadProfilePicture } = require("../controller/user");

const upload = multer();

router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, patchMe);
router.post("/me/profile-picture", authMiddleware, upload.single("profilePicture"), uploadProfilePicture);

module.exports = router;