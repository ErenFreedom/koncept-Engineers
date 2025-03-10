const express = require("express");
const { sendStaffAppLoginOtp, verifyStaffAppLoginOtp, refreshStaffAppToken, logoutStaffApp } = require("../controllers/authStaffAppController");

const router = express.Router();

router.post("/send-otp", sendStaffAppLoginOtp);
router.post("/verify-otp", verifyStaffAppLoginOtp);
router.post("/refresh-token", refreshStaffAppToken);
router.post("/logout", logoutStaffApp);

module.exports = router;