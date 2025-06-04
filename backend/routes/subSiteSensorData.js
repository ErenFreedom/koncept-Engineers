const express = require("express");
const router = express.Router();
const { insertSubsiteSensorData } = require("../controllers/subSiteSensorDataController");

router.post("/receive-data", insertSubsiteSensorData);

module.exports = router;
