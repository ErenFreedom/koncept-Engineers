const express = require("express");
const { registerAdmin, sendRegistrationOtp } = require("../controllers/adminController");
const { upload } = require("../utils/s3Uploader");

const router = express.Router();

router.post("/send-otp", sendRegistrationOtp); // Send OTP
router.post("/register", upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "gst", maxCount: 1 }
]), registerAdmin); // Verify OTP & Register

module.exports = router;
