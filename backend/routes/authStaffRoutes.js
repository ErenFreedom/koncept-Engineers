const express = require("express");
const { sendStaffLoginOtp, verifyStaffLoginOtp, refreshStaffToken, logoutStaff } = require("../controllers/authStaffController");

const router = express.Router();

router.post("/send-otp", sendStaffLoginOtp);
router.post("/verify-otp", verifyStaffLoginOtp);
router.post("/refresh-token", refreshStaffToken);
router.post("/logout", logoutStaff);

module.exports = router;
