const express = require("express");
const { verifyAuthToken } = require("../middleware/authMiddleware");
const { addSensor, getAllSensors, deleteSensor } = require("../controllers/sensorController");

const router = express.Router();

router.post("/add", verifyAuthToken, addSensor);  // ✅ Protected Route
router.get("/", verifyAuthToken, getAllSensors); // ✅ Protected Route
router.delete("/:id", verifyAuthToken, deleteSensor); // ✅ Protected Route

module.exports = router;
