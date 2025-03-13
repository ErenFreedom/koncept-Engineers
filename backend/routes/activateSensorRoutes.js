const express = require("express");
const { activateSensor, deactivateSensor, removeActiveSensor } = require("../controllers/activateSensorController");

const router = express.Router();

router.post("/activate", activateSensor);   // ✅ Activate a Sensor
router.post("/deactivate", deactivateSensor); // ✅ Deactivate a Sensor
router.post("/remove", removeActiveSensor); // ✅ Remove a Sensor from Active Sensors

module.exports = router;
