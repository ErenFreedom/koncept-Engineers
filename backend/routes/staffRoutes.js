const express = require("express");
const { registerStaff } = require("../controllers/staffController");
const { upload } = require("../utils/s3Uploader");

const router = express.Router();

router.post("/register", upload.single("document"), registerStaff);

module.exports = router;
