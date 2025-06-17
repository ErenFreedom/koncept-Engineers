const express = require("express");
const router = express.Router();
const {
  getFloors,
  getRooms,
  getFloorAreas,
  getRoomSegments,
  getPoEs,
  getSubSiteFloors,
  getSubSiteRooms,
  getSubSiteFloorAreas,
  getSubSiteRoomSegments,
  getSubSitePoEs,
} = require("../controllers/floorRoomFetchController");

router.get("/floors", getFloors);
router.get("/rooms", getRooms);
router.get("/floor-areas", getFloorAreas);
router.get("/room-segments", getRoomSegments);
router.get("/poes", getPoEs);

router.get("/subsite/floors", getSubSiteFloors);
router.get("/subsite/rooms", getSubSiteRooms);
router.get("/subsite/floor-areas", getSubSiteFloorAreas);
router.get("/subsite/room-segments", getSubSiteRoomSegments);
router.get("/subsite/poes", getSubSitePoEs);


module.exports = router;
