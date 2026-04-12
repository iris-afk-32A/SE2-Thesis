const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { addRoom, getRooms, deleteRoom, getRoomSpecifications, updateRoomSpecification } = require("../controller/room")


router.post("/create", authMiddleware, addRoom);
router.get("/list", authMiddleware, getRooms);
router.get("/specs/:roomId", authMiddleware, getRoomSpecifications);
router.delete("/:roomId", authMiddleware, deleteRoom);
router.patch("/:roomId/specification", authMiddleware, updateRoomSpecification);

module.exports = router;