const express = require("express");
const { activateSensor, deactivateSensor, removeActiveSensor, getAllActiveSensors, getAllManagedSensors } = require("../controllers/sensorActivationController.js");

const router = express.Router();

router.get("/active", getAllActiveSensors);  // Get all Sensors
router.post("/activate", activateSensor);   // ✅ Activate a Sensor
router.post("/deactivate", deactivateSensor); // ✅ Deactivate a Sensor
router.post("/remove", removeActiveSensor); // ✅ Remove a Sensor from Active Sensors
router.get("/managed", verifyAuthToken, getAllManagedSensors);


module.exports = router;
