const express = require("express");
const router = express.Router();
const {
  activateSubSiteSensor,
  deactivateSubSiteSensor,
  removeActiveSubSiteSensor,
  getAllActiveSubSiteSensors,
  getAllManagedSubSiteSensors,
  reactivateSubSiteSensor,
} = require("../controllers/subSiteSensorActivationController");

router.post("/activate", activateSubSiteSensor);

router.post("/deactivate", deactivateSubSiteSensor);

router.post("/remove", removeActiveSubSiteSensor);

router.get("/active", getAllActiveSubSiteSensors);

router.get("/all", getAllManagedSubSiteSensors);

router.post("/reactivate", reactivateSubSiteSensor);

module.exports = router;
