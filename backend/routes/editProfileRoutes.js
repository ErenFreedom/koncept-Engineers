const express = require("express");
const router = express.Router();

const { updateAdminProfile } = require("../controllers/updateAdminProfile");
const { verifyAdminPassword } = require("../controllers/verifyAdminPassword");


router.put("/admin/profile/edit/:adminId", updateAdminProfile);


router.post("/admin/profile/verify-password", verifyAdminPassword);

module.exports = router;
