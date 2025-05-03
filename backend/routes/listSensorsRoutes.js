const express = require("express");
const router = express.Router();
const { listSensors } = require("../controllers/listSensorsController");


router.get("/list", listSensors);

module.exports = router;
