const express = require("express");
const router = express.Router();
const { listSensors } = require("../controllers/listSensorsController");

// ✅ API Endpoint to List Sensors
router.get("/list", listSensors);

module.exports = router;
