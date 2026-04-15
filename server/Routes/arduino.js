const express = require("express");
const router = express.Router();
const { controlDevices } = require("../controller/arduino");

router.post("/manual", controlDevices);

module.exports = router;