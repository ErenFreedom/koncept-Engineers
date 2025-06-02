const express = require("express");
const router = express.Router();
const { syncSubSiteLocalDbFromCloud } = require("../controllers/subsiteSyncController");

router.get("/sync/subsite-db", syncSubSiteLocalDbFromCloud);

module.exports = router;
