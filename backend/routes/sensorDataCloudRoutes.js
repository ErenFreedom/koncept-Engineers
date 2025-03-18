const express = require("express");
const { insertSensorData } = require("../controllers/sensorDataCloudController");

const router = express.Router();

// ✅ API to accept sensor data in batch mode
router.post("/receive-data", insertSensorData);

module.exports = router;
