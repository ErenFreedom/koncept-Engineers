const express = require("express");
const router = express.Router();
const {
  getSubSiteFloors,
  getSubSiteRooms,
  getSubSiteSensors,
} = require("../controllers/subsiteFloorRoomFetchController");

router.get("/floor/list", getSubSiteFloors);
router.get("/room/list", getSubSiteRooms);
router.get("/sensor/list", getSubSiteSensors);

module.exports = router;
