const express = require("express");
const router = express.Router();
const {
  getFloors,
  getRooms,
  getSensors,
} = require("../controllers/floorRoomFetchController");

router.get("/floor/list", getFloors);
router.get("/room/list", getRooms);
router.get("/sensor/list", getSensors);

module.exports = router;
