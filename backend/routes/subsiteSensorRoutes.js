const express = require("express");
const {
  addSubSiteSensor,
  getAllSubSiteSensors,
  deleteSubSiteSensor
} = require("../controllers/subsiteSensorController");

const router = express.Router();

router.post("/add", addSubSiteSensor);
router.get("/all", getAllSubSiteSensors);
router.delete("/delete/:id", deleteSubSiteSensor);

module.exports = router;
