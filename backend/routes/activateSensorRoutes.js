const express = require("express");
const { activateSensor, deactivateSensor, removeActiveSensor, getAllActiveSensors, getAllManagedSensors, reactivateSensor } = require("../controllers/sensorActivationController.js");

const router = express.Router();

router.get("/active", getAllActiveSensors);  
router.post("/activate", activateSensor);   
router.post("/deactivate", deactivateSensor); 
router.post("/remove", removeActiveSensor); 
router.get("/managed", getAllManagedSensors);
router.post("/reactivate", reactivateSensor);   


module.exports = router;
