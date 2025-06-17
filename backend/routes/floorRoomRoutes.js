const express = require("express");
const router = express.Router();
const {
  addFloor,
  addRoom,
  addFloorArea,
  addRoomSegment,
  addPieceOfEquipment,
  assignSensorToPoE,
  unassignSensorFromPoE,
  deleteFloor,
  deleteRoom,
  deleteFloorArea,
  deleteRoomSegment,
  deletePieceOfEquipment,
  editFloor,
  editRoom,
  editFloorArea,
  editRoomSegment,
  editPieceOfEquipment
} = require("../controllers/floorRoomController");

router.post("/floor/add", addFloor);
router.post("/room/add", addRoom);
router.post("/floor-area/add", addFloorArea);
router.post("/room-segment/add", addRoomSegment);
router.post("/poe/add", addPieceOfEquipment);

router.post("/sensor/assign-room", assignSensorToPoE);
router.post("/sensor/unassign-room", unassignSensorFromPoE);

router.delete("/floor/delete", deleteFloor);
router.delete("/room/delete", deleteRoom);
router.delete("/floor-area/delete", deleteFloorArea);
router.delete("/room-segment/delete", deleteRoomSegment);
router.delete("/poe/delete", deletePieceOfEquipment);

router.put("/floor/edit", editFloor);
router.put("/room/edit", editRoom);
router.put("/floor-area/edit", editFloorArea);
router.put("/room-segment/edit", editRoomSegment);
router.put("/poe/edit", editPieceOfEquipment);


module.exports = router;
