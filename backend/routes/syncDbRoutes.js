const express = require("express");
const router = express.Router();
const { syncFromCloud } = require("../controllers/syncDbController");

router.get("/sync/local-db", syncFromCloud);

module.exports = router;
