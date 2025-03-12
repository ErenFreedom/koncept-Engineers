const express = require("express");
const { addSensor, getAllSensors, deleteSensor } = require("../controllers/sensorBankController");

const router = express.Router();

router.post("/add", addSensor);
router.get("/all", getAllSensors);
router.delete("/delete/:id", deleteSensor);

module.exports = router;
