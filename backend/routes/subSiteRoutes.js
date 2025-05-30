const express = require("express");
const { sendSubSiteOtp, registerSubSite, listSubSites } = require("../controllers/subSiteController");

const router = express.Router();


router.post("/subsite/send-otp", sendSubSiteOtp);

router.post("/subsite/register", registerSubSite);

router.get("/list", listSubSites);


module.exports = router;
