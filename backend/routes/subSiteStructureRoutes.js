const express = require("express");
const router = express.Router();
const {
  addFloor,
  addRoom,
  addFloorArea,
  addRoomSegment,
  addPieceOfEquipment,
  deleteSubsiteFloor,
  deleteSubsiteRoom,
  deleteSubsiteFloorArea,
  deleteSubsiteRoomSegment,
  deleteSubsitePieceOfEquipment,
  assignSensorToPoE_SubSite,
  unassignSensorFromPoE_SubSite,
  editSubsiteFloor,
  editSubsiteRoom,
  editSubsiteFloorArea,
  editSubsiteRoomSegment,
  editSubsitePieceOfEquipment,
  getPoePath_SubSite,
} = require("../controllers/subSiteStructureController");

router.post("/floor/add", addFloor);
router.post("/room/add", addRoom);
router.post("/floor-area/add", addFloorArea);
router.post("/room-segment/add", addRoomSegment);
router.post("/poe/add", addPieceOfEquipment);

router.delete("/floor/delete", deleteSubsiteFloor);
router.delete("/room/delete", deleteSubsiteRoom);
router.delete("/floor-area/delete", deleteSubsiteFloorArea);
router.delete("/room-segment/delete", deleteSubsiteRoomSegment);
router.delete("/poe/delete", deleteSubsitePieceOfEquipment);

router.post("/sensor/assign-room", assignSensorToPoE_SubSite);
router.post("/sensor/unassign-room", unassignSensorFromPoE_SubSite);

router.put("/floor/edit", editSubsiteFloor);
router.put("/room/edit", editSubsiteRoom);
router.put("/floor-area/edit", editSubsiteFloorArea);
router.put("/room-segment/edit", editSubsiteRoomSegment);
router.put("/poe/edit", editSubsitePieceOfEquipment);

router.get("/poe/subsite/path", getPoePath_SubSite);



module.exports = router;
