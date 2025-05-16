const express = require("express");
const router = express.Router();
const { addFloor, addRoom, assignSensorToRoom } = require("../controllers/floorRoomController");

router.post("/floor/add", addFloor);

router.post("/room/add", addRoom);

router.post("/sensor/assign-room", assignSensorToRoom);

module.exports = router;
