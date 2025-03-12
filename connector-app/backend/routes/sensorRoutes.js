const express = require("express");
const { verifyAuthToken } = require("../middlewares/authMiddleware");
const { addSensor, getAllSensors, deleteSensor } = require("../controllers/sensorController");

const router = express.Router();

router.post("/add", verifyAuthToken, addSensor);  // ✅ Protected Route (Only Authenticated Users)
router.get("/", verifyAuthToken, getAllSensors); // ✅ Protected Route (Fetch All Sensors)
router.delete("/:id", verifyAuthToken, deleteSensor); // ✅ Protected Route (Delete a Sensor)

module.exports = router;
