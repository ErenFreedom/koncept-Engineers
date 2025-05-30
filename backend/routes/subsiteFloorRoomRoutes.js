const express = require("express");
const router = express.Router();
const {
  addSubSiteFloor,
  addSubSiteRoom,
  deleteSubSiteFloor,
  deleteSubSiteRoom,
  assignSensorToSubSiteRoom,
  unassignSensorFromSubSiteRoom
} = require("../controllers/subsiteFloorRoomController");

router.post("/floor/add", addSubSiteFloor);
router.post("/room/add", addSubSiteRoom);
router.post("/floor/delete", deleteSubSiteFloor);
router.post("/room/delete", deleteSubSiteRoom);
router.post("/sensor/assign", assignSensorToSubSiteRoom);
router.post("/sensor/unassign", unassignSensorFromSubSiteRoom);

module.exports = router;
