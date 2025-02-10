const express = require("express");
const { registerAdmin } = require("../controllers/adminController");
const { upload } = require("../utils/s3Uploader");

const router = express.Router();

router.post("/register", upload.fields([
    { name: "aadhar", maxCount: 1 },
    { name: "pan", maxCount: 1 },
    { name: "gst", maxCount: 1 }
]), registerAdmin);

module.exports = router;
