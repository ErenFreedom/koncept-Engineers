const express = require("express");
const { sendAdminLoginOtp, verifyAdminLoginOtp, refreshAdminToken, logoutAdmin } = require("../controllers/adminAuthController");

const router = express.Router();

router.post("/send-otp", sendAdminLoginOtp);
router.post("/verify-otp", verifyAdminLoginOtp);
router.post("/refresh-token", refreshAdminToken);
router.post("/logout", logoutAdmin);

module.exports = router;
