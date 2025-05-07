const express = require("express");
const router = express.Router();
const { syncLocalDbFromCloud } = require("../controllers/syncDbController");

router.get("/sync/local-db", syncLocalDbFromCloud);

module.exports = router;
