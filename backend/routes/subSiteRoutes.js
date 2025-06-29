const express = require("express");
const {
  sendSubSiteOtp,
  registerSubSite,
  listSubSites,
  getMainSiteInfo,
  editMainSiteInfo,
  editSubSiteInfo,
  deleteSubSite,
} = require("../controllers/subSiteController");

const router = express.Router();

router.post("/subsite/send-otp", sendSubSiteOtp);
router.post("/subsite/register", registerSubSite);

router.get("/list", listSubSites);

router.get("/main-site/info", getMainSiteInfo);
router.put("/main-site/edit", editMainSiteInfo);

router.put("/subsite/edit", editSubSiteInfo);
router.delete("/subsite/delete", deleteSubSite);

module.exports = router;
