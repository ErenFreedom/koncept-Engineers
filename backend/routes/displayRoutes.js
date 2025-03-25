const express = require("express");
const router = express.Router();
const { getActiveSensorData } = require("../controllers/displaySensorDataController");

// ✅ Protected route (ensure JWT middleware if needed)
router.get("/dashboard/sensors", getActiveSensorData);

module.exports = router;
