const express = require("express");
const router = express.Router();
const classroomRequestController = require("../controller/classroom_request");
const authMiddleware = require("../middleware/authMiddleware");

// Create a classroom request (non-admin users)
router.post("/create-request", authMiddleware, classroomRequestController.createClassroomRequest);

// Get pending classroom requests (admin only)
router.get("/pending-requests", authMiddleware, classroomRequestController.getPendingClassroomRequests);

// Approve a classroom request (admin only)
router.post("/approve-request", authMiddleware, classroomRequestController.approveClassroomRequest);

// Reject a classroom request (admin only)
router.post("/reject-request", authMiddleware, classroomRequestController.rejectClassroomRequest);

module.exports = router;
