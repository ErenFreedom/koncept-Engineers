const express = require("express");
const { authenticateAdmin } = require("../controllers/cloudAdminAuthController");

const router = express.Router();

router.post("/verify-otp", authenticateAdmin);

module.exports = router;
