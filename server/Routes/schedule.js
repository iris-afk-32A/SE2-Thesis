const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { addSchedule, getSchedulesByRoom } = require("../controller/schedule");

router.post("/create", authMiddleware, addSchedule);
router.get("/:roomId", authMiddleware, getSchedulesByRoom);

module.exports = router;