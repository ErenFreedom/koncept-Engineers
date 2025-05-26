const express = require("express");
const router = express.Router();
const { addFloor, addRoom, assignSensorToRoom, deleteRoom, deleteFloor, unassignSensorFromRoom } = require("../controllers/floorRoomController");

router.post("/floor/add", addFloor);

router.post("/room/add", addRoom);

router.post("/sensor/assign-room", assignSensorToRoom);

router.post("/sensor/unassign-room", unassignSensorFromRoom);

router.delete("/room/delete", deleteRoom);
router.delete("/floor/delete", deleteFloor);

module.exports = router;
