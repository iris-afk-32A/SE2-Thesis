const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware")
const { addOrg, getOrg, getOrgMembers, removeMember, getPendingApplications, approveApplication, rejectApplication, getNotifications, updateOrganization } = require("../controller/organization")

router.post("/addOrganization", authMiddleware, addOrg);
router.get("/getOrganization", authMiddleware, getOrg);
router.get("/getMembers", authMiddleware, getOrgMembers);
router.post("/removeMember", authMiddleware, removeMember);
router.get("/getPendingApplications", authMiddleware, getPendingApplications);
router.post("/approveApplication", authMiddleware, approveApplication);
router.post("/rejectApplication", authMiddleware, rejectApplication);
router.get("/getNotifications", authMiddleware, getNotifications);
router.patch("/update-organization", authMiddleware, updateOrganization);

module.exports = router;