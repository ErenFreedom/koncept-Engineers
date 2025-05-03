const express = require("express");
const router = express.Router();
const { getActiveSensorData } = require("../controllers/displaySensorDataController");


router.get("/dashboard/sensors", getActiveSensorData);

module.exports = router;
