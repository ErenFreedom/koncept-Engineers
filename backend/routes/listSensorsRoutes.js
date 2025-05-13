const express = require("express");
const router = express.Router();
const { listSensors , listFullSensorInfo} = require("../controllers/listSensorsController");


router.get("/list", listSensors);
router.get("/full-info", listFullSensorInfo);

module.exports = router;
