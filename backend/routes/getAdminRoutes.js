const express = require("express");
const router = express.Router();
const { getAdminProfile } = require("../controllers/getAdminProfile");


router.get("/admin/profile/:adminId", getAdminProfile);

module.exports = router;
