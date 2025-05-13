const express = require("express");
const router = express.Router();
const { listSensors , listFullSensorInfo} = require("../controllers/listSensorsController");
const verifyCloudToken = require("../middlewares/verifyCloudToken");



router.get("/list", listSensors);
router.get("/full-info",verifyCloudToken, listFullSensorInfo);

module.exports = router;
