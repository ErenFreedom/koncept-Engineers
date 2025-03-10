const express = require("express");
const { storeDesigoCredentials } = require("../controllers/desigoAuthController");

const router = express.Router();

router.post("/store-credentials", storeDesigoCredentials);

module.exports = router;
