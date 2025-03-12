const express = require("express");
const { authenticateStaff } = require("../controllers/cloudStaffAuthController");

const router = express.Router();

router.post("/verify-otp", authenticateStaff);

module.exports = router;
