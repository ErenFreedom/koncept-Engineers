const express = require("express");
const { insertSensorData } = require("../controllers/sensorDataCloudController");

const router = express.Router();


router.post("/receive-data", insertSensorData);

module.exports = router;
