const express = require("express");
const router = express.Router();
const { listSensors, listFullSensorInfo, listActiveSensorsMainSite, listActiveSensorsSubSite, } = require("../controllers/listSensorsController");
const verifyCloudToken = require("../middlewares/verifyCloudToken");

router.get("/list", listSensors); 
router.get("/full-info", verifyCloudToken, listFullSensorInfo); 

router.get("/active-sensors", listActiveSensorsMainSite);
router.get("/subsite/active-sensors", listActiveSensorsSubSite);

module.exports = router;
