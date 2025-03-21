const express = require("express");
const { verifyAuthToken } = require("../middlewares/authMiddleware");
const { activateSensor, deactivateSensor, removeActiveSensor, getAllActiveSensors } = require("../controllers/activateSensorController");

const router = express.Router();

router.get("/active", verifyAuthToken, getAllActiveSensors);
router.post("/activate", verifyAuthToken, activateSensor);   // ✅ Route to activate sensor
router.post("/deactivate", verifyAuthToken, deactivateSensor); // ✅ Route to deactivate sensor
router.post("/remove", verifyAuthToken, removeActiveSensor); // ✅ Route to remove sensor

module.exports = router;
