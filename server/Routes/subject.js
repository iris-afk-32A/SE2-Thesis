const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { addSubject, getSubjects, deleteSubject } = require("../controller/subject");

router.post("/create", authMiddleware, addSubject);
router.get("/list", authMiddleware, getSubjects);
router.delete("/:subjectId", authMiddleware, deleteSubject);

module.exports = router;
