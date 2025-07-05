const express = require("express");
const router = express.Router();
const {
  getActiveSensorDataMainSite,
  getActiveSensorDataSubSite,
} = require("../controllers/displaySensorDataController");

router.get("/sensor-data/active", getActiveSensorDataMainSite);

router.get("/sensor-data/subsite/active", getActiveSensorDataSubSite);

module.exports = router;
