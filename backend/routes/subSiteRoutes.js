const express = require("express");
const { sendSubSiteOtp, registerSubSite } = require("../controllers/subSiteController");

const router = express.Router();


router.post("/subsite/send-otp", sendSubSiteOtp);

router.post("/subsite/register", registerSubSite);

module.exports = router;
