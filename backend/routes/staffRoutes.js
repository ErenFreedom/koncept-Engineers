const express = require("express");
const { registerStaff, sendRegistrationOtp } = require("../controllers/staffController");
const { upload } = require("../utils/s3Uploader");

const router = express.Router();

router.post("/send-otp", sendRegistrationOtp); 
router.post("/register", upload.fields([{ name: "document", maxCount: 1 }]), registerStaff); 

module.exports = router;
